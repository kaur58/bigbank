export interface StartGameResponse {
  gameId: string;
  lives: number;
  gold: number;
  level: number;
  score: number;
  highScore?: number;
  turn?: number;
}
