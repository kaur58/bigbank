import type { BuyResponse, GameApiClient, ShopItem } from '../clients/dragonsApiClient';

export class ShoppingService {
  constructor(private readonly apiClient: GameApiClient) {}

  listItems(gameId: string): Promise<ShopItem[]> {
    return this.apiClient.getShop(gameId);
  }

  buyItem(gameId: string, itemId: string): Promise<BuyResponse> {
    return this.apiClient.buy(gameId, itemId);
  }
}
