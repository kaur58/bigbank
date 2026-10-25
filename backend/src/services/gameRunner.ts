import type { Ad } from '../models/ad.js';
import type { AdsResponse } from '../models/adsResponse.js';
import type { ApiClient } from '../models/apiClient.js';
import type { GameState } from '../models/gameState.js';
import type { Logger } from '../models/logger.js';
import type { ShopItem } from '../models/shopItem.js';
import type { ShopResponse } from '../models/shopResponse.js';
import type { TurnResponse } from '../models/turnResponse.js';
import { ApiError } from '../clients/apiClient.js';
import { chooseAd } from '../utils/adventureProbability.js';
import { choosePurchase } from '../utils/itemBuying.js';
import { waitForEnter } from '../utils/pause.js';

function asList<T>(payload: T[] | Record<string, T[] | undefined>, keys: string[], label: string): T[] {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    const list = payload[key];
    if (Array.isArray(list)) return list;
  }
  throw new Error(`Game API returned an invalid ${label} response.`);
}

function initialState(payload: Awaited<ReturnType<ApiClient['startGame']>>): GameState {
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
    failedAdv: 0,
    successAdv: 0,
    lastFailed: false,
    sortedAds: [],
    currentAdv: null,
  };
}

export class GameRunner {
  private readonly api: ApiClient;
  private readonly logger: Logger;
  private readonly maxTurns: number;
  private gameState!: GameState;
  private stopRequested = false;

  constructor({ api, logger = console, maxTurns = 1000 }: { api: ApiClient; logger?: Logger; maxTurns?: number }) {
    this.api = api;
    this.logger = logger;
    this.maxTurns = maxTurns;
  }

  private asList<T>(payload: T[] | Record<string, T[] | undefined>, keys: string[], label: string): T[] {
    return asList(payload, keys, label);
  }

  requestStop(): void {
    if (this.stopRequested) return;
    this.stopRequested = true;
    this.logger.info('Stop requested. Finishing the current API action before exiting.');
    this.logCurrentState();
  }

  private logCurrentState(): void {
    if (!this.gameState) {
      this.logger.info('Current game state is not available yet.');
      return;
    }
    this.logger.info(
      `Game ${this.gameState.gameId ?? '(starting)'} | turn ${this.gameState.turn} | lives ${this.gameState.lives} | gold ${this.gameState.gold} | level ${this.gameState.level} | score ${this.gameState.score} | high score ${this.gameState.highScore} | successful ads ${this.gameState.successAdv} | failed ads ${this.gameState.failedAdv}`,
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
        this.gameState.successAdv += 1;
        this.gameState.lastFailed = false;
      } else {
        this.logger.info(this.gameState.sortedAds);
        this.logger.info(this.gameState.currentAdv);
        this.logger.info(payload);
        await waitForEnter('failed mission. lets see what happened')
        this.gameState.failedAdv += 1;
        this.gameState.lastFailed = true;
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
    const shop = this.asList<ShopItem>(await this.api.getShop(gameId) as ShopResponse, ['shoppingList', 'shop'], 'shop');

    while (!this.stopRequested && this.gameState.lives > 0) {
      if (this.gameState.turn >= this.maxTurns) {
        throw new Error(`Stopped after ${this.maxTurns} turns to prevent an infinite loop.`);
      }

      const ads = this.asList<Ad>(await this.api.getAds(gameId) as AdsResponse, ['adventures', 'ads', 'messages'], 'ads');
      this.gameState.sortedAds = chooseAd(ads);
      this.gameState.currentAdv = this.gameState.sortedAds[0] ?? null;

      const itemsToBuy = choosePurchase(shop, this.gameState);
      for (const item of itemsToBuy) {
        if (this.stopRequested) break;
        this.logger.info(`Turn ${this.gameState.turn}: buying ${item.name} (${item.cost} gold).`);
        try {
          await this.updateGameState(await this.api.buy(gameId, item.id), true);
        } catch (error) {
          this.logger.info(`Buy ${item.name} failed; continuing: ${formatError(error)}`);
        }
      }

      if (this.stopRequested) break;
      if (this.gameState.currentAdv) {
        this.logger.info(`Turn ${this.gameState.turn}: solving ${this.gameState.currentAdv.ad.adId} [${(this.gameState.currentAdv.probability * 100).toFixed(0)}% estimated, reward ${this.gameState.currentAdv.ad.reward}].`);
        try {
          await this.updateGameState(await this.api.solve(gameId, this.gameState.currentAdv.ad.adId));
        } catch (error) {
          this.logger.info(`Solve ${this.gameState.currentAdv.ad.adId} failed; continuing: ${formatError(error)}`);
          continue;
        }
      } else {
        throw new Error('No actionable ads were returned while the game is still alive.');
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

function formatError(error: unknown): string {
  if (error instanceof ApiError) {
    return `${error.message}${error.status ? ` (HTTP ${error.status})` : ''}`;
  }
  return error instanceof Error ? error.message : String(error);
}
