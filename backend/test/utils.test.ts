import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseAd, estimateSuccess } from '../src/utils/adventureProbability.js';
import { choosePurchase } from '../src/utils/itemBuying.js';
import { formatError } from '../src/utils/formatError.js';
import { ApiError } from '../src/clients/apiClient.js';
import type { Ad } from '../src/models/ad.js';
import type { ShopItem } from '../src/models/shopItem.js';

const makeAd = (adId: string, probability: string, expiresIn = 3): Ad => ({
  adId,
  message: 'A normal quest',
  reward: 20,
  expiresIn,
  probability,
});

test('maps known probability tiers and treats unknown tiers conservatively', () => {
  const tiers: Array<[string, number]> = [
    ['Sure thing', 0.98],
    ['Piece of cake', 0.95],
    ['Walk in the park', 0.9],
    ['Quite likely', 0.8],
    ['Rather likely', 0.75],
    ['Hmmm....', 0.3],
    ['Gamble', 0.3],
    ['Risky', 0.2],
    ['Playing with fire', 0.1],
    ['Rather detrimental', 0.1],
    ['Suicide mission', 0.05],
    ['Impossible', 0],
  ];
  for (const [label, expected] of tiers) {
    assert.equal(estimateSuccess(makeAd(label, label)), expected, `tier: ${label}`);
  }
  assert.equal(estimateSuccess(makeAd('unknown', 'unknown')), 0);
});

test('sorts live ads by expected reward and ignores expired or malformed ads', () => {
  const choices = chooseAd([
    makeAd('risky', 'Gamble'),
    { ...makeAd('higher-value', 'Gamble'), reward: 100 },
    makeAd('safe', 'Sure thing'),
    { ...makeAd('short-deadline', 'Sure thing', 1), reward: 20 },
    makeAd('expired', 'Sure thing', 0),
    { ...makeAd('invalid-reward', 'Sure thing'), reward: Number.NaN },
    { ...makeAd('invalid-expiry', 'Sure thing'), expiresIn: Number.NaN },
    { ...makeAd('', 'Sure thing') },
  ]);
  assert.deepEqual(choices.map(choice => choice.ad.adId), ['short-deadline', 'higher-value', 'safe', 'risky']);
  assert.equal(choices[0].expectedReward, 19.6);
  assert.equal(choices[1].expectedReward, 10);
  assert.equal(choices[2].expectedReward, 19.6 / 3);
  assert.equal(choices[3].expectedReward, 2);
  assert.deepEqual(chooseAd([]), []);
});

test('does not choose known trap messages', () => {
  const trap = { ...makeAd('trap', 'Sure thing'), message: 'Help sell a Super Awesome Diamond today' };
  assert.deepEqual(chooseAd([trap]), []);
  assert.equal(estimateSuccess(trap), 0);
});

test('try-all mode includes zero-probability ads but still excludes expired ads', () => {
  const choices = chooseAd([
    makeAd('unknown', 'unlisted'),
    makeAd('expired', 'unlisted', 0),
    makeAd('safe', 'Sure thing'),
  ], true);
  assert.deepEqual(choices.map(choice => choice.ad.adId), ['safe', 'unknown']);
  assert.equal(choices[1].expectedReward, 0);
});

test('formats API errors with status and handles ordinary and non-error values', () => {
  assert.equal(formatError(new ApiError('request failed', { status: 503 })), 'request failed (HTTP 503)');
  assert.equal(formatError(new ApiError('network failed')), 'network failed');
  assert.equal(formatError(new Error('ordinary failure')), 'ordinary failure');
  assert.equal(formatError('unexpected value'), 'unexpected value');
});

test('buys priority items first and up to the extra item limit after a failed adventure', () => {
  const shop: ShopItem[] = [
    { id: 'hpot', name: 'Healing Potion', cost: 50 },
    { id: 'wingpotmax', name: 'Wing Potion', cost: 300 },
    { id: 'small', name: 'Small upgrade', cost: 100 },
    { id: 'large', name: 'Large upgrade', cost: 350 },
    { id: 'too-large', name: 'Too large', cost: 500 },
  ];
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 800, lastFailed: true }).map(item => item.id), ['wingpotmax', 'hpot', 'small']);
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 450, lastFailed: false }).map(item => item.id), ['hpot']);
});

test('only buys extra items after failure, and honors the minimum balance and reserve', () => {
  const shop: ShopItem[] = [
    { id: 'hpot', name: 'Healing Potion', cost: 50 },
    { id: 'small', name: 'Small upgrade', cost: 20 },
  ];
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 20, lastFailed: false }), []);
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 49, lastFailed: true }), []);
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 100, lastFailed: false }).map(item => item.id), ['hpot']);
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 100, lastFailed: true }).map(item => item.id), ['hpot']);
});

test('only buys the wing upgrade after a failure and applies its balance boundary', () => {
  const shop: ShopItem[] = [
    { id: 'wingpotmax', name: 'Wing Potion', cost: 300 },
    { id: 'hpot', name: 'Healing Potion', cost: 50 },
  ];
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 400, lastFailed: true }).map(item => item.id), ['hpot']);
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 401, lastFailed: true }).map(item => item.id), ['wingpotmax', 'hpot']);
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 401, lastFailed: false }).map(item => item.id), ['hpot']);
  assert.deepEqual(choosePurchase(shop, { lives: 4, gold: 401, lastFailed: true }).map(item => item.id), ['wingpotmax']);
  assert.deepEqual(choosePurchase(shop, { lives: 4, gold: 100, lastFailed: true }), []);
});

test('requires 400 gold for items costing over 300 and preserves the extra-item reserve', () => {
  const shop: ShopItem[] = [
    { id: 'large', name: 'Large upgrade', cost: 301 },
    { id: 'exact-threshold', name: 'Upgrade', cost: 300 },
    { id: 'small', name: 'Small upgrade', cost: 100 },
  ];
  assert.deepEqual(choosePurchase(shop, { lives: 4, gold: 399, lastFailed: true }).map(item => item.id), ['exact-threshold']);
  assert.deepEqual(choosePurchase(shop, { lives: 4, gold: 400, lastFailed: true }).map(item => item.id), ['large']);
  assert.deepEqual(choosePurchase(shop, { lives: 4, gold: 350, lastFailed: true }).map(item => item.id), ['small']);
});

test('buys at most the configured number of extra items', () => {
  const shop: ShopItem[] = [
    { id: 'one', name: 'One', cost: 10 },
    { id: 'two', name: 'Two', cost: 10 },
    { id: 'three', name: 'Three', cost: 10 },
  ];
  assert.deepEqual(choosePurchase(shop, { lives: 4, gold: 500, lastFailed: true }).map(item => item.id), ['one', 'two']);
});
