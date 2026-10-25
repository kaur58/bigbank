import type { Ad } from './ad.js';

export interface AdChoice {
  ad: Ad;
  probability: number;
}
