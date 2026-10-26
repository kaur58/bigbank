import type { Ad } from './ad.js';
import type { ShopItem } from './shopItem.js';
import type { StartGameResponse } from './startGameResponse.js';
import type { TurnResponse } from './turnResponse.js';

export interface ApiClient {
  startGame(): Promise<StartGameResponse>;
  getAds(gameId: string): Promise<Ad[]>;
  getShop(gameId: string): Promise<ShopItem[]>;
  solve(gameId: string, adId: string): Promise<TurnResponse>;
  buy(gameId: string, itemId: string): Promise<TurnResponse>;
}
