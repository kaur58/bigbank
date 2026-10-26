export interface StartGameResponse {
  gameId: string
  lives: number
  gold: number
  level: number
  score: number
  highScore: number
  turn: number
}

export interface Ad {
  adId: string
  message: string
  reward: number
  expiresIn: number
  encrypted?: string | number
  probability: string
  successProbability: number;
  expectedReward: number;
}

export interface ShopItem {
  id: string
  name: string
  cost: number
}

export interface SolveResponse {
  success: boolean
  lives: number
  gold: number
  level: number
  score: number
  highScore: number
  turn: number
  message: string
}

export interface BuyResponse {
  shoppingSuccess: boolean
  lives: number
  gold: number
  level: number
  turn: number
}

export interface GameStats {
  lives: number
  gold: number
  level: number
  score: number
  highScore: number
  turn: number
}
