import type { Ad } from './ad.js';

export interface AdChoice {
  ad: Ad;
  successProbability: number;
  expectedReward: number;
}
