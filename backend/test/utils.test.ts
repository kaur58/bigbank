import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseAd, estimateSuccess } from '../src/utils/adventureProbability.js';
import { choosePurchase } from '../src/utils/itemBuying.js';
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
    makeAd('expired', 'Sure thing', 0),
  ]);
  assert.deepEqual(choices.map(choice => choice.ad.adId), ['higher-value', 'safe', 'risky']);
  assert.equal(choices[1].expectedReward, 19.6);
  assert.deepEqual(chooseAd([]), []);
});

test('does not choose known trap messages', () => {
  const trap = { ...makeAd('trap', 'Sure thing'), message: 'Help sell a Super Awesome Diamond today' };
  assert.deepEqual(chooseAd([trap]), []);
  assert.equal(estimateSuccess(trap), 0);
});

test('buys the level upgrade and potion first, then other items after a failed adventure', () => {
  const shop: ShopItem[] = [
    { id: 'hpot', name: 'Healing Potion', cost: 50 },
    { id: 'wingpotmax', name: 'Wing Potion', cost: 300 },
    { id: 'small', name: 'Small upgrade', cost: 100 },
    { id: 'large', name: 'Large upgrade', cost: 350 },
    { id: 'too-large', name: 'Too large', cost: 500 },
  ];
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 800, lastFailed: true }).map(item => item.id), ['wingpotmax', 'hpot', 'small', 'large']);
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 450, lastFailed: false }).map(item => item.id), ['wingpotmax', 'hpot']);
});

test('does not buy other upgrades until an adventure fails and buys potions only when affordable', () => {
  const shop: ShopItem[] = [
    { id: 'hpot', name: 'Healing Potion', cost: 50 },
    { id: 'small', name: 'Small upgrade', cost: 20 },
  ];
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 20, lastFailed: false }), []);
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 100, lastFailed: true }).map(item => item.id), ['hpot', 'small']);
});

test('covers the wing upgrade balance boundary and full-health potion rule', () => {
  const shop: ShopItem[] = [
    { id: 'wingpotmax', name: 'Wing Potion', cost: 300 },
    { id: 'hpot', name: 'Healing Potion', cost: 50 },
  ];
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 400 }).map(item => item.id), ['hpot']);
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 401 }).map(item => item.id), ['wingpotmax', 'hpot']);
  assert.deepEqual(choosePurchase(shop, { lives: 4, gold: 401 }).map(item => item.id), ['wingpotmax']);
  assert.deepEqual(choosePurchase(shop, { lives: 4, gold: 100 }), []);
});
