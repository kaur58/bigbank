import type { Ad } from '../models/ad.js';
import type { AdChoice } from '../models/adChoice.js';

const TIER_PROBABILITY = new Map<string, number>([
  ['sure thing', 0.98],
  ['piece of cake', 0.95],
  ['walk in the park', 0.90],
  ['quite likely', 0.80],
  ['rather likely', 0.75],
  ['hmmm....', 0.30],
  ['gamble', 0.30],
  ['risky', 0.20],
  ['playing with fire', 0.10],
  ['rather detrimental', 0.10],
  ['suicide mission', 0.05],
  ['impossible', 0],
]);

const TRAPS = ['super awesome diamond'];

export function estimateSuccess(ad: Ad): number {
  if (TRAPS.includes(ad.message.toLowerCase())) return 0;
  const label = String(ad.probability ?? '').toLowerCase().trim();
  for (const [tier, probability] of TIER_PROBABILITY) {
    if (label.includes(tier)) return probability * ad.reward;
  }
  return 0;
}

/** Return available adventures sorted by their estimated score. */
export function chooseAd(ads: Ad[]): AdChoice[] {
  if (!Array.isArray(ads)) throw new TypeError('Ads response must be an array.');
  return ads
    .filter(ad => ad?.adId && Number.isFinite(Number(ad.reward)) && Number.isFinite(Number(ad.expiresIn)) && ad.expiresIn >= 1)
    .map(ad => ({ ad, probability: estimateSuccess(ad) }))
    .filter(choice => choice.probability > 0)
    .sort((a, b) => b.probability - a.probability);
}
