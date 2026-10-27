import express, { type ErrorRequestHandler, type Request, type RequestHandler, type Response as ExpressResponse } from 'express';
import http from 'node:http';
import {
  ApiError,
  DragonsApiClient,
  DEFAULT_BASE_URL,
  type GameApiClient
} from './clients/dragonsApiClient';
import { GameService } from './services/gameService';
import { AdventureService } from './services/adventureService';
import { ShoppingService } from './services/shoppingService';

const MAX_BODY_BYTES = '1mb';

export interface AppOptions {
  apiClient?: GameApiClient;
  fetchImpl?: typeof fetch;
  upstreamUrl?: string;
}

function isBodyParserError(error: unknown): error is Error & { type?: string; status?: number; body?: unknown } {
  return error instanceof Error;
}

export function createApp({
  apiClient,
  fetchImpl = globalThis.fetch,
  upstreamUrl = DEFAULT_BASE_URL
}: AppOptions = {}): express.Express {
  const client = apiClient ?? new DragonsApiClient({ baseUrl: upstreamUrl, fetchImpl });
  const gameService = new GameService(client);
  const adventureService = new AdventureService(client);
  const shoppingService = new ShoppingService(client);
  const app = express();

  app.use((request, response, next) => {
    response.set({
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST',
      'access-control-allow-headers': 'content-type'
    });
    next();
  });
  app.options('*', (request, response) => response.sendStatus(204));
  app.use(express.json({ limit: MAX_BODY_BYTES }));

  function sendServiceResult(result: unknown, response: ExpressResponse): void {
    response.json(result);
  }

  function serviceRoute(handler: (request: Request) => Promise<unknown>): RequestHandler {
    return (request, response) => {
      void handler(request)
        .then((result) => sendServiceResult(result, response))
        .catch((error: unknown) => {
          if (error instanceof ApiError) {
            const status = error.status && error.status >= 400 ? error.status : 502;
            response.status(status).json({
              error: error.message,
              ...(error.response ? { details: error.response } : {})
            });
            return;
          }
          response.status(500).json({ error: 'An internal server error occurred' });
        });
    };
  }

  app.get('/health', (request, response) => response.json({ status: 'ok' }));

  app.post('/api/game', serviceRoute(() => gameService.startGame()));

  app.get('/api/game/:gameId/adventures', serviceRoute((request) =>
    adventureService.listAdventures(request.params.gameId)));
  app.post('/api/game/:gameId/adventures/:adventureId/solve', serviceRoute((request) =>
    adventureService.solveAdventure(request.params.gameId, request.params.adventureId)));

  app.get('/api/game/:gameId/shop', serviceRoute((request) =>
    shoppingService.listItems(request.params.gameId)));
  app.post('/api/game/:gameId/shop/:itemId/buy', serviceRoute((request) =>
    shoppingService.buyItem(request.params.gameId, request.params.itemId)));

  app.use((request, response) => response.status(404).json({ error: 'Route not found' }));
  const errorHandler: ErrorRequestHandler = (error: unknown, request, response, next) => {
    if (response.headersSent) {
      next(error);
      return;
    }
    if (isBodyParserError(error) && error.type === 'entity.too.large') {
      response.status(413).json({ error: 'Request body is too large' });
      return;
    }
    if (isBodyParserError(error) && error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      response.status(400).json({ error: 'Request body must be valid JSON' });
      return;
    }
    response.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
  };
  app.use(errorHandler);

  return app;
}

export function createServer(options: AppOptions = {}): http.Server {
  return http.createServer(createApp(options));
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer({ upstreamUrl: process.env.GAME_API_URL || DEFAULT_BASE_URL })
    .listen(port, () => console.log(`Dragons of Mugloar REST API listening on port ${port}`));
}
