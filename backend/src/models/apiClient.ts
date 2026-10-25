import type { AdsResponse } from './adsResponse.js';
import type { ShopResponse } from './shopResponse.js';
import type { StartGameResponse } from './startGameResponse.js';
import type { TurnResponse } from './turnResponse.js';

export interface ApiClient {
  startGame(): Promise<StartGameResponse>;
  getAds(gameId: string): Promise<AdsResponse>;
  getShop(gameId: string): Promise<ShopResponse>;
  solve(gameId: string, adId: string): Promise<TurnResponse>;
  buy(gameId: string, itemId: string): Promise<TurnResponse>;
}
