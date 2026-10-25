import type { GameState } from '../models/gameState.js';
import type { ShopItem } from '../models/shopItem.js';
import { PURCHASE_RULES, SHOP_ITEM_IDS } from '../constants.js';

/** Select shop purchases according to current lives, balance, and last outcome. */
export function choosePurchase(
  shop: ShopItem[],
  state: Pick<GameState, 'lives' | 'gold'> & Partial<Pick<GameState, 'lastFailed'>>,
): ShopItem[] {
  if (!Array.isArray(shop) || !state || state.lives <= 0) return [];

  let availableGold = Number(state.gold);
  if (availableGold < PURCHASE_RULES.MINIMUM_AVAILABLE_GOLD) {
    return [];
  }

  const purchases: ShopItem[] = [];
  let buyingCount = 0;

  if (state.lastFailed && state.gold > PURCHASE_RULES.WING_UPGRADE_BALANCE_THRESHOLD) {
    const item = shop.find(item => item.id === SHOP_ITEM_IDS.WING_UPGRADE);
    if (item) {
      purchases.push(item);
      availableGold -= Number(item.cost);
      buyingCount++
    }
  }

  if (state.lives < PURCHASE_RULES.HEALING_POTION_LIVES_THRESHOLD) {
    const healingPotion = shop.find(item => item.id === SHOP_ITEM_IDS.HEALING_POTION);
    if (healingPotion && availableGold > Number(healingPotion.cost)) {
      purchases.push(healingPotion);
      availableGold -= Number(healingPotion.cost);
      buyingCount++
    }
  }

  if (state.lastFailed) {
    for (const item of shop) {
      if (buyingCount >= PURCHASE_RULES.MAX_EXTRA_ITEMS_PER_TURN) break;
      const cost = Number(item.cost);
      if (
        !Number.isFinite(cost) ||
        cost < 0 ||
        availableGold < cost ||
        availableGold - cost < PURCHASE_RULES.MINIMUM_REMAINING_GOLD_FOR_EXTRA_ITEMS
      ) continue;
      if (
        cost > PURCHASE_RULES.HIGH_COST_ITEM_THRESHOLD &&
        availableGold < PURCHASE_RULES.MINIMUM_GOLD_FOR_HIGH_COST_ITEM
      ) continue;
      if (item.id === SHOP_ITEM_IDS.HEALING_POTION || item.id === SHOP_ITEM_IDS.WING_UPGRADE) continue;
      purchases.push(item);
      availableGold -= cost;
      buyingCount++;
    }
  }

  return purchases;
}
