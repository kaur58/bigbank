#!/usr/bin/env node
import { ApiError, GameApiClient } from './clients/apiClient.js';
import { GameRunner } from './services/gameRunner.js';

const runner = new GameRunner({ api: new GameApiClient() });
const handleInterrupt = (): void => runner.requestStop();
process.on('SIGINT', handleInterrupt);

try {
  await runner.play();
} catch (error: unknown) {
  if (error instanceof ApiError) {
    console.error(`Game API error${error.status ? ` (HTTP ${error.status})` : ''}: ${error.message} endpoint: ${error.endpoint}, response: ${JSON.stringify(error.response)}`);
  } else if (error instanceof Error) {
    console.error(`Unable to play game: ${error.message}`);
  } else {
    console.error('Unable to play game due to an unexpected error.', error);
  }
  process.exitCode = 1;
} finally {
  process.off('SIGINT', handleInterrupt);
}
