export const DEFAULT_GAME_API_BASE_URL = 'https://dragonsofmugloar.com/api/v2';

export const AD_SUCCESS_PROBABILITIES = {
  'sure thing': 0.98,
  'piece of cake': 0.95,
  'walk in the park': 0.9,
  'quite likely': 0.8,
  'rather likely': 0.75,
  'hmmm....': 0.3,
  'gamble': 0.3,
  'risky': 0.2,
  'playing with fire': 0.1,
  'rather detrimental': 0.1,
  'suicide mission': 0.05,
  'impossible': 0,
} as const;

export const TRAP_ADVENTURE_PHRASES = ['super awesome diamond'] as const;

export const SHOP_ITEM_IDS = {
  HEALING_POTION: 'hpot',
  WING_UPGRADE: 'wingpotmax',
} as const;

export const PURCHASE_RULES = {
  MINIMUM_AVAILABLE_GOLD: 50,
  WING_UPGRADE_BALANCE_THRESHOLD: 400,
  HEALING_POTION_LIVES_THRESHOLD: 4,
  MINIMUM_REMAINING_GOLD_FOR_EXTRA_ITEMS: 51,
  MAX_EXTRA_ITEMS_PER_TURN: 2,
  HIGH_COST_ITEM_THRESHOLD: 300,
  MINIMUM_GOLD_FOR_HIGH_COST_ITEM: 400,
} as const;

export const GAME_RUNNER_DEFAULTS = {
  MAX_TURNS: 1_000,
  RETRY_DELAY_MS: 500,
  MAX_RETRY_DELAY_MS: 15_000,
} as const;
