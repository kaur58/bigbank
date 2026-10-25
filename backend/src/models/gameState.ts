import type { AdChoice } from './adChoice.js';

export interface GameState {
  gameId: string | null;
  lives: number;
  gold: number;
  level: number;
  score: number;
  highScore: number;
  turn: number;
  lastFailed: boolean;
  failedAdv: number;
  successAdv: number;
  sortedAds: AdChoice[];
}
