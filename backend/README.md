# Dragons of Mugloar player

A Node.js console player that starts a game, evaluates available ads, optionally buys a healing potion when lives are low, and continues until the game ends.

## Requirements

- Node.js 20 or newer (uses built-in `fetch`, `node:test`, and `AbortSignal.timeout`)
- Internet access to the Dragons of Mugloar API

## Run

```sh
npm start
```

Set `MUGLOAR_API_URL` to use a compatible API endpoint or test server. It defaults to `https://dragonsofmugloar.com/api/v2`.

## Tests

```sh
npm test
```

## Design

- `src/models/` holds the game API and internal state types, one model per file.
- `src/clients/apiClient.ts` owns HTTP, timeouts, JSON parsing, and upstream errors.
- `src/utils/adventureProbability.ts` ranks available adventures.
- `src/utils/itemBuying.ts` selects purchases.
- `src/services/gameRunner.ts` coordinates game turns and logs progress.
- `src/main.ts` is the command-line entry point and reports failures with a nonzero exit code.

The adventure scorer maps known descriptive tiers to approximate probabilities, multiplies by the reward, and selects the highest scoring unexpired ad. The purchase helper considers the `wingpotmax` and `hpot` items, then considers other affordable items after a failed adventure.
