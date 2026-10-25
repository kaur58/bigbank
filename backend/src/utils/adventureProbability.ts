import type { Ad } from '../models/ad.js';
import type { AdChoice } from '../models/adChoice.js';
import { AD_SUCCESS_PROBABILITIES, TRAP_ADVENTURE_PHRASES } from '../constants.js';

export function estimateSuccess(ad: Ad): number {
  const adventureText = ad.message.toLowerCase();
  if (TRAP_ADVENTURE_PHRASES.some(phrase => adventureText.includes(phrase.toLowerCase()))) {
    return 0;
  }
  const label = String(ad.probability ?? '').toLowerCase().trim();
  for (const [tier, probability] of Object.entries(AD_SUCCESS_PROBABILITIES)) {
    if (label.includes(tier)) {
      return probability;
    }
  }
  return 0;
}

export function chooseAd(ads: Ad[], tryAll = false): AdChoice[] {
  if (!Array.isArray(ads)) throw new TypeError('Ads response must be an array.');
  return ads
    .filter(ad => ad?.adId && Number.isFinite(Number(ad.reward)) && Number.isFinite(Number(ad.expiresIn)) && ad.expiresIn >= 1)
    .map(ad => {
      const successProbability = estimateSuccess(ad);
      return { ad, successProbability, expectedReward: successProbability * ad.reward / ad.expiresIn };
    })
    .filter(choice => choice.expectedReward > 0 || tryAll)
    .sort((a, b) => b.expectedReward - a.expectedReward || b.successProbability - a.successProbability);
}
