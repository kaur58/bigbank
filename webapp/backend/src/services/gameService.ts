import type { GameApiClient, StartGameResponse } from '../clients/dragonsApiClient';

export class GameService {
  constructor(private readonly apiClient: GameApiClient) { }

  startGame(): Promise<StartGameResponse> {
    return this.apiClient.startGame();
  }
}
