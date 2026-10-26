import type { Ad, GameApiClient, SolveResponse } from '../clients/dragonsApiClient';
import { AD_SUCCESS_PROBABILITIES, TRAP_ADVENTURE_PHRASES } from '../constants.js';

export interface AdChoice extends Ad {
  successProbability: number;
  expectedReward: number;
}

export class AdventureService {
  constructor(private readonly apiClient: GameApiClient) { }

  estimateSuccess(ad: Ad): number {
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

  decodeOrderAdventures(ads: Ad[]): AdChoice[] {
    const decodedAds = ads.map(ad => {
      if (ad?.encrypted !== 1 && ad?.encrypted !== 2) return ad;
      const decode = ad.encrypted === 1
        ? (value: string): string => Buffer.from(value, 'base64').toString('utf8')
        : (value: string): string => value.replace(/[a-zA-Z]/g, character => {
          const base = character <= 'Z' ? 65 : 97;
          return String.fromCharCode(((character.charCodeAt(0) - base + 13) % 26) + base);
        });
      return {
        ...ad,
        adId: decode(ad.adId),
        message: decode(ad.message),
        probability: decode(ad.probability),
      };
    });

    return decodedAds
      .filter(ad => ad?.adId && Number.isFinite(Number(ad.reward)) && Number.isFinite(Number(ad.expiresIn)) && ad.expiresIn >= 1)
      .map(ad => {
        const successProbability = this.estimateSuccess(ad);
        return { ...ad, successProbability, expectedReward: successProbability * ad.reward / ad.expiresIn };
      })
      .sort((a, b) => b.expectedReward - a.expectedReward || b.successProbability - a.successProbability);
  }

  async listAdventures(gameId: string): Promise<AdChoice[]> {
    return this.decodeOrderAdventures(await this.apiClient.getAds(gameId));
  }

  solveAdventure(gameId: string, adventureId: string): Promise<SolveResponse> {
    return this.apiClient.solve(gameId, adventureId);
  }
}
