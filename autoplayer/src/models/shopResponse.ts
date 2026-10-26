import type { ShopItem } from './shopItem.js';

export type ShopResponse = ShopItem[] | { shoppingList?: ShopItem[]; shop?: ShopItem[] };
