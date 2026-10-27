import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRunner } from '../src/services/gameRunner.js';
import type { ApiClient, Logger } from '../src/models/index.js';

const logger: Logger = { info() { } };

function makeApi(overrides: Partial<ApiClient> = {}): ApiClient {
  return {
    startGame: async () => ({ gameId: 'g1', lives: 3, gold: 10, level: 1, score: 0 }),
    getAds: async () => [{ adId: 'a1', message: 'Quest', reward: 10, expiresIn: 3, probability: 'Sure thing' }],
    getShop: async () => [],
    solve: async () => ({ lives: 0, gold: 20, level: 1, score: 10, turn: 1, success: true }),
    buy: async () => ({ lives: 3, gold: 10, turn: 1 }),
    ...overrides,
  };
}

test('continues after buy and solve errors, with a delay before retrying solve', async () => {
  let buyAttempts = 0;
  let solveAttempts = 0;
  const api = makeApi({
    startGame: async () => ({ gameId: 'g1', lives: 3, gold: 100, level: 1, score: 0 }),
    getShop: async () => [{ id: 'hpot', name: 'Healing Potion', cost: 1 }],
    buy: async () => {
      buyAttempts += 1;
      throw new Error('temporary buy failure');
    },
    solve: async () => {
      solveAttempts += 1;
      if (solveAttempts === 1) throw new Error('temporary solve failure');
      return { lives: 0, gold: 20, level: 1, score: 10, turn: 1, success: true };
    },
  });

  const result = await new GameRunner({ api, logger, retryDelayMs: 1 }).play();

  assert.equal(buyAttempts, 2);
  assert.equal(solveAttempts, 2);
  assert.equal(result.score, 10);
});

test('Ctrl+C stop request exits after the active API call and returns the current state', async () => {
  let runner!: GameRunner;
  let solveAttempts = 0;
  const api = makeApi({
    getAds: async () => {
      runner.requestStop();
      return [{ adId: 'a1', message: 'Quest', reward: 10, expiresIn: 3, probability: 'Sure thing' }];
    },
    solve: async () => {
      solveAttempts += 1;
      return { lives: 0, gold: 20, level: 1, score: 10, turn: 1, success: true };
    },
  });
  runner = new GameRunner({ api, logger });

  const result = await runner.play();

  assert.equal(solveAttempts, 0);
  assert.equal(result.gameId, 'g1');
  assert.equal(result.lives, 3);
});

test('stop request interrupts retry backoff', async () => {
  let runner!: GameRunner;
  let solveAttempts = 0;
  const stoppingLogger: Logger = {
    info(message?: unknown) {
      if (typeof message === 'string' && message.startsWith('Solve ')) {
        setImmediate(() => runner.requestStop());
      }
    },
  };
  const api = makeApi({
    solve: async () => {
      solveAttempts += 1;
      throw new Error('temporary solve failure');
    },
  });
  runner = new GameRunner({ api, logger: stoppingLogger, retryDelayMs: 10_000 });

  const result = await runner.play();

  assert.equal(solveAttempts, 1);
  assert.equal(result.gameId, 'g1');
  assert.equal(result.lives, 3);
});

test('updates loss counters when an adventure resolves unsuccessfully', async () => {
  const api = makeApi({
    solve: async () => ({ lives: 0, gold: 10, level: 1, score: 0, turn: 1, success: false }),
  });

  const result = await new GameRunner({ api, logger }).play();

  assert.equal(result.failedAds, 1);
  assert.equal(result.successAds, 0);
  assert.equal(result.lastFailed, true);
});

test('rejects an invalid start-game response', async () => {
  const api = makeApi({
    startGame: async () => ({ gameId: '', lives: 3, gold: 10, level: 1, score: 0 }),
  });

  await assert.rejects(new GameRunner({ api, logger }).play(), /missing gameId or lives/);
});

test('enforces the configured turn limit', async () => {
  let solveAttempts = 0;
  const messages: string[] = [];
  const turnLogger: Logger = { info(message?: unknown) { if (typeof message === 'string') messages.push(message); } };
  const api = makeApi({
    solve: async () => {
      solveAttempts += 1;
      return { lives: 3, gold: 20, level: 1, score: 10, turn: 1, success: true };
    },
  });

  const result = await new GameRunner({ api, logger: turnLogger, maxTurns: 1 }).play();
  assert.equal(solveAttempts, 1);
  assert.equal(result.turn, 1);
  assert.ok(messages.includes('Stopped after 1 turns to prevent an infinite loop.'));
});

test('keeps sorted ads on game state and retries unknown probability ads once', async () => {
  let adCalls = 0;
  let solveCalls = 0;
  const api = makeApi({
    getAds: async () => {
      adCalls += 1;
      return [{ adId: 'unknown-ad', message: 'Quest', reward: 10, expiresIn: 3, probability: 'Unlisted' }];
    },
    solve: async () => {
      solveCalls += 1;
      return { lives: 0, gold: 20, level: 1, score: 10, turn: 1, success: true };
    },
  });

  const result = await new GameRunner({ api, logger }).play();

  assert.equal(adCalls, 2);
  assert.equal(solveCalls, 1);
  assert.equal(result.tryEveryAd, false);
  assert.deepEqual(result.sortedAds.map(choice => choice.ad.adId), ['unknown-ad']);
});

test('updates score, high score, level, and success counters from a successful solve', async () => {
  const api = makeApi({
    startGame: async () => ({ gameId: 'g1', lives: 3, gold: 10, level: 1, score: 4, highScore: 5, turn: 0 }),
    solve: async () => ({ lives: 2, gold: 30, level: 2, score: 25, highScore: 25, turn: 1, success: true }),
  });

  const result = await new GameRunner({ api, logger, maxTurns: 1 }).play();

  assert.equal(result.lives, 2);
  assert.equal(result.gold, 30);
  assert.equal(result.level, 2);
  assert.equal(result.score, 25);
  assert.equal(result.highScore, 25);
  assert.equal(result.successAds, 1);
  assert.equal(result.failedAds, 0);
  assert.equal(result.lastFailed, false);
});
