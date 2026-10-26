# Dragons of Mugloar REST API

An Express based TypeScript REST API that forwards game actions to the Dragons of Mugloar API.

Express routes delegate to separate game, adventure, and shopping services. Those services use the shared Dragons API client for upstream HTTP requests.

## Run

Requires Node.js 18 or newer. Install dependencies with `npm install` before starting the service.

```sh
npm start
```

The service listens on port `3000` by default. Set `PORT` to change it, or `GAME_API_URL` to use a different upstream API base URL (default: `https://dragonsofmugloar.com/api/v2`).

## Endpoints

Successful game operations return typed JSON data from the Dragons API. API errors return a JSON error object; network failures return `502`.

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/games` | Start a game |
| `GET` | `/api/games/:gameId/adventures` | Get available adventures |
| `POST` | `/api/games/:gameId/adventures/:adventureId/solve` | Solve an adventure |
| `GET` | `/api/games/:gameId/shopping-items` | Get available shopping items |
| `POST` | `/api/games/:gameId/shopping-items/:itemId/purchase` | Buy an item |
| `GET` | `/health` | Check whether this service is running |

POST routes trigger their corresponding game operation; the Dragons API client supplies the required upstream request details.

## Unit tests

Run the built-in Node test runner with `npm test`.

Compile the TypeScript source with `npm run build`.
