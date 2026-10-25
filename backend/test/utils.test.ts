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
  assert.equal(estimateSuccess(makeAd('sure', 'Sure thing')), 0.98);
  assert.equal(estimateSuccess(makeAd('gamble', 'Gamble')), 0.3);
  assert.equal(estimateSuccess(makeAd('unknown', 'unknown')), 0);
});

test('sorts the safest live ads first and ignores expired or malformed ads', () => {
  const choices = chooseAd([
    makeAd('risky', 'Gamble'),
    makeAd('safe', 'Sure thing'),
    makeAd('expired', 'Sure thing', 0),
  ]);
  assert.deepEqual(choices.map(choice => choice.ad.adId), ['safe', 'risky']);
  assert.deepEqual(chooseAd([]), []);
});

test('does not choose known trap messages', () => {
  const trap = { ...makeAd('trap', 'Sure thing'), message: 'Super Awesome Diamond' };
  assert.deepEqual(chooseAd([trap]), []);
});

test('always schedules hpot and buys other items within the available budget', () => {
  const shop: ShopItem[] = [
    { id: 'hpot', name: 'Healing Potion', cost: 50 },
    { id: 'small', name: 'Small upgrade', cost: 100 },
    { id: 'large', name: 'Large upgrade', cost: 350 },
    { id: 'too-large', name: 'Too large', cost: 500 },
  ];
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 800 }).map(item => item.id), ['hpot', 'small', 'large']);
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 450 }).map(item => item.id), ['hpot', 'small']);
});

test('still returns hpot when gold is insufficient and requires 400 banked for items over 300', () => {
  const shop: ShopItem[] = [
    { id: 'hpot', name: 'Healing Potion', cost: 50 },
    { id: 'large', name: 'Large upgrade', cost: 350 },
  ];
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 20 }).map(item => item.id), ['hpot']);
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 399 }).map(item => item.id), ['hpot']);
  assert.deepEqual(choosePurchase(shop, { lives: 3, gold: 450 }).map(item => item.id), ['hpot', 'large']);
});
