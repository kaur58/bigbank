import type { GameState } from '../models/gameState.js';
import type { ShopItem } from '../models/shopItem.js';

/** Select shop purchases according to current lives, balance, and last outcome. */
export function choosePurchase(
  shop: ShopItem[],
  state: Pick<GameState, 'lives' | 'gold'> & Partial<Pick<GameState, 'lastFailed'>>,
): ShopItem[] {
  if (!Array.isArray(shop) || !state || state.lives <= 0) return [];

  let availableGold = Number(state.gold);
  const purchases: ShopItem[] = [];
  if (state.gold > 400) {
    const item = shop.find(item => item.id === 'wingpotmax');
    if (item) {
      purchases.push(item);
      availableGold -= Number(item.cost);
    }
  }

  const healingPotion = shop.find(item => item.id === 'hpot');
  if (healingPotion && state.lives < 4 && availableGold > Number(healingPotion.cost)) {
    purchases.push(healingPotion);
    availableGold -= Number(healingPotion.cost);
  }

  if (state.lastFailed) {
    for (const item of shop) {
      const cost = Number(item.cost);
      if (!Number.isFinite(cost) || cost < 0 || availableGold < cost) continue;
      if (item.id === 'hpot' || item.id === 'wingpotmax') continue;
      purchases.push(item);
      availableGold -= cost;
    }
  }

  return purchases;
}
