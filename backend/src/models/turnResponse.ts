export interface TurnResponse {
  gameId?: string;
  lives: number;
  gold: number;
  level?: number;
  score?: number;
  highScore?: number;
  turn: number;
  success?: boolean;
  message?: string;
}
