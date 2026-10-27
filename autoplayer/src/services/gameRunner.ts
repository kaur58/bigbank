import type { ApiClient, GameState, Logger, StartGameResponse, TurnResponse } from '../models/index.js';
import { GAME_RUNNER_DEFAULTS } from '../constants.js';
import { ApiError } from '../clients/apiClient.js';
import { chooseAd } from '../utils/adventureProbability.js';
import { formatError } from '../utils/formatError.js';
import { choosePurchase } from '../utils/itemBuying.js';

function initialState(payload: StartGameResponse): GameState {
  if (!payload.gameId || !Number.isFinite(Number(payload.lives))) {
    throw new Error('Start-game response is missing gameId or lives.');
  }
  return {
    gameId: payload.gameId,
    lives: payload.lives,
    gold: payload.gold,
    level: payload.level,
    score: payload.score,
    highScore: payload.highScore ?? 0,
    turn: payload.turn ?? 0,
    failedAds: 0,
    successAds: 0,
    lastFailed: false,
    tryEveryAd: false,
    sortedAds: [],
  };
}

export class GameRunner {
  private readonly api: ApiClient;
  private readonly logger: Logger;
  private readonly maxTurns: number;
  private readonly retryDelayMs: number;
  private readonly maxRetryDelayMs: number;
  private gameState!: GameState;
  private stopRequested = false;
  private consecutiveActionFailures = 0;
  private readonly stopWaiters = new Set<() => void>();

  constructor({
    api,
    logger = console,
    maxTurns = GAME_RUNNER_DEFAULTS.MAX_TURNS,
    retryDelayMs = GAME_RUNNER_DEFAULTS.RETRY_DELAY_MS,
    maxRetryDelayMs = GAME_RUNNER_DEFAULTS.MAX_RETRY_DELAY_MS,
  }: { api: ApiClient; logger?: Logger; maxTurns?: number; retryDelayMs?: number; maxRetryDelayMs?: number }) {
    this.api = api;
    this.logger = logger;
    this.maxTurns = maxTurns;
    this.retryDelayMs = retryDelayMs;
    this.maxRetryDelayMs = maxRetryDelayMs;
  }

  requestStop(): void {
    if (this.stopRequested) return;
    this.stopRequested = true;
    for (const wakeWaiter of this.stopWaiters) wakeWaiter();
    this.stopWaiters.clear();
    this.logger.info('Stop requested. Finishing the current API action before exiting.');
    this.logCurrentState();
  }

  private waitBeforeRetry(): Promise<void> {
    if (this.stopRequested) return Promise.resolve();
    this.consecutiveActionFailures += 1;
    const delay = Math.min(this.retryDelayMs * (this.consecutiveActionFailures - 1), this.maxRetryDelayMs);
    return new Promise(resolve => {
      const finish = (): void => {
        clearTimeout(timer);
        this.stopWaiters.delete(finish);
        resolve();
      };
      const timer = setTimeout(finish, delay);
      this.stopWaiters.add(finish);
    });
  }

  private logCurrentState(): void {
    if (!this.gameState) {
      this.logger.info('Current game state is not available yet.');
      return;
    }
    this.logger.info(
      `Game ${this.gameState.gameId ?? '(starting)'} | turn ${this.gameState.turn} | lives ${this.gameState.lives} | gold ${this.gameState.gold} | level ${this.gameState.level} | score ${this.gameState.score} | high score ${this.gameState.highScore} | successful ads ${this.gameState.successAds} | failed ads ${this.gameState.failedAds}`,
    );
  }

  private async updateGameState(payload: TurnResponse, isBuying = false): Promise<void> {
    this.gameState.lives = payload.lives;
    this.gameState.gold = payload.gold;
    this.gameState.turn = payload.turn;
    if (payload.level !== undefined) this.gameState.level = payload.level;
    if (payload.highScore !== undefined) this.gameState.highScore = payload.highScore;

    if (!isBuying) {
      if (payload.score !== undefined) this.gameState.score = payload.score;
      if (payload.success) {
        this.gameState.successAds += 1;
        this.gameState.lastFailed = false;
      } else {
        this.gameState.failedAds += 1;
        this.gameState.lastFailed = true;
        this.logger.info(`Solved failed! ${payload.message}`);
      }
    }
  }
  async play(): Promise<GameState> {
    this.gameState = initialState(await this.api.startGame());
    const gameId = this.gameState.gameId!;
    this.logger.info(`Started game ${gameId} (lives: ${this.gameState.lives}, gold: ${this.gameState.gold}).`);

    if (this.stopRequested) {
      this.logCurrentState();
      return this.gameState;
    }
    const shop = await this.api.getShop(gameId);

    while (!this.stopRequested && this.gameState.lives > 0) {
      if (this.gameState.turn >= this.maxTurns) {
        this.logger.info(`Stopped after ${this.maxTurns} turns to prevent an infinite loop.`);
        break;
      }

      const itemsToBuy = choosePurchase(shop, this.gameState);
      for (const item of itemsToBuy) {
        if (this.stopRequested) break;
        this.logger.info(`Turn ${this.gameState.turn}: buying ${item.name} (${item.cost} gold).`);
        try {
          await this.updateGameState(await this.api.buy(gameId, item.id), true);
          this.consecutiveActionFailures = 0;
        } catch (error) {
          this.logger.info(`Buy ${item.name} failed; continuing: ${formatError(error)}`);
          if (!(error instanceof ApiError && error.status === 400)) {
            await this.waitBeforeRetry();
          }
        }
      }

      const ads = await this.api.getAds(gameId);
      this.gameState.sortedAds = chooseAd(ads, this.gameState.tryEveryAd);
      if (this.gameState.tryEveryAd && this.gameState.sortedAds.length > 0) {
        this.gameState.tryEveryAd = false;
      }
      const currentAdv = this.gameState.sortedAds[0] ?? null;

      if (this.stopRequested) break;

      if (currentAdv) {
        this.logger.info(`Turn ${this.gameState.turn}: solving ${currentAdv.ad.adId} [${(currentAdv.successProbability * 100).toFixed(0)}% success chance, ${currentAdv.expectedReward.toFixed(1)} expected reward].`);
        try {
          await this.updateGameState(await this.api.solve(gameId, currentAdv.ad.adId));
          this.consecutiveActionFailures = 0;
        } catch (error) {
          this.logger.info(`Solve ${currentAdv.ad.adId} failed; continuing: ${formatError(error)}`);
          await this.waitBeforeRetry();
          continue;
        }
      } else {
        this.logger.info('No actionable ads were returned while the game is still alive.');
        if (this.gameState.tryEveryAd) {
          break;
        }
        this.gameState.tryEveryAd = true;
        continue;
      }

      this.logger.info(`Lives: ${this.gameState.lives}; gold: ${this.gameState.gold}; score: ${this.gameState.score};`);
      if (this.gameState.lives <= 0) break;
    }

    if (this.stopRequested) {
      this.logger.info('Stopped by user. Latest game state:');
      this.logCurrentState();
    } else {
      this.logger.info(`Game over. Final score: ${this.gameState.score}.`);
    }

    return this.gameState;
  }
}
