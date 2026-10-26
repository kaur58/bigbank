# Dragon's Mugloar

A responsive Vue 3 and TypeScript frontend for the Dragon's Mugloar adventure game. It uses Pinia for game state and Tailwind CSS for styling.

## Requirements

- Node.js 20 or newer
- npm
- The game API running locally, or an API URL to configure

## Install

Install the project dependencies:

```sh
npm install
```

Create a local environment file from the example:

```sh
cp .env.example .env
```

By default, `.env` points the frontend to `http://localhost:3000`:

```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

Change this value if the API is hosted elsewhere. The API must allow requests from the frontend origin (CORS).

## Run the development server

Start the API, then run:

```sh
npm run dev
```

Vite prints the local URL in the terminal, usually `http://localhost:5173`.

## Test

Run the Vitest test suite:

```sh
npm test
```

## Production build

Type-check the app and create the production bundle:

```sh
npm run build
```

Preview the production bundle locally:

```sh
npm run preview
```

## Project layout

- `src/components/` contains the landing and game views, adventure and shop lists and items, stat display, and dialogs.
- `src/stores/game.ts` manages the current game and player state with Pinia.
- `src/services/api.ts` contains the typed API requests.
- `src/types/game.ts` defines the API and game data models.
- `src/style.css` loads Tailwind's layers; component styling is written with Tailwind utility classes.
- `public/` contains static assets such as the favicon.

## Autoplay

Backend return calculated probabilties to all adventures. 
Autoplay takes highest probabilty and tries to solve it. 
Also it buy healt if lives are low and other items if there is gold for it but always leaves gold for one healing potion
