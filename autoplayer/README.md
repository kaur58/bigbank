# Dragons of Mugloar player

A Node.js console player that starts a game, ranks available ads, optionally buys shop items, and continues until the game ends.

## Requirements

- Node.js 20 or newer (uses built-in `fetch`, `node:test`, and `AbortSignal.timeout`)
- Internet access to the Dragons of Mugloar API

## Install

```sh
npm install
```

## Run

```sh
npm start
```

Set `MUGLOAR_API_URL` to use a compatible API endpoint or test server. It defaults to `https://dragonsofmugloar.com/api/v2`.

## Tests

```sh
npm test
```

Generate terminal and HTML code coverage reports with:

```sh
npm run coverage
```

The HTML report is written to `coverage/index.html`.

## Design

- `src/models/` holds the game API and internal state types, one model per file.
- `src/clients/apiClient.ts` owns HTTP, timeouts, JSON parsing, and upstream errors.
- `src/utils/adventureProbability.ts` ranks available adventures.
- `src/utils/itemBuying.ts` selects purchases.
- `src/services/gameRunner.ts` coordinates game turns and logs progress.
- `src/main.ts` is the command-line entry point and reports failures with a nonzero exit code.

The API client normalizes wrapped ad and shop responses into arrays before the game runner sees them. 
The adventure scorer maps known descriptive tiers to approximate success probabilities and selects the highest expected reward among unexpired ads. 
Failed buy and solve calls are logged.
Ctrl+C stops after the active API call and prints the current game state.

## Future plans
- better logic for buying item maybe
- better logic for adventure probability calculations
- maybe add some logic if 2 adventures fail in a row to then buy something
- change so that each loop iterations does not make request if there are still good adventures to pick from
- same logic to shop item list as well
