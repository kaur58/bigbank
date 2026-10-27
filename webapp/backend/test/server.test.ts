import test from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createServer } from '../src/server';

async function withServer(fetchImpl: typeof fetch, callback: (baseUrl: string) => Promise<void>): Promise<void> {
  const server = createServer({ fetchImpl, upstreamUrl: 'https://game.test/api/v2' });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as AddressInfo;
  try {
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

function fakeResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

test('starts a game and forwards the upstream response', async () => {
  let call: { url: string; options?: RequestInit } | undefined;
  const fetchImpl: typeof fetch = async (input, init) => {
    call = { url: String(input), options: init };
    return fakeResponse({ gameId: 'abc', lives: 3 });
  };
  await withServer(fetchImpl, async (base) => {
    const response = await fetch(`${base}/api/game`, { method: 'POST' });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { gameId: 'abc', lives: 3 });
  });
  assert.equal(call?.url, 'https://game.test/api/v2/game/start');
  assert.equal(call?.options?.method, 'POST');
});

test('supports CORS preflight for API routes', async () => {
  await withServer(async () => fakeResponse({}), async (base) => {
    const response = await fetch(`${base}/api/game`, {
      method: 'OPTIONS',
      headers: { 'access-control-request-method': 'POST' }
    });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), '*');
    assert.equal(response.headers.get('access-control-allow-methods'), 'GET, POST');
  });
});

test('maps adventure and shopping routes to game service routes', async () => {
  const calls: string[] = [];
  const fetchImpl: typeof fetch = async (input) => {
    calls.push(String(input));
    return fakeResponse({ ok: true });
  };
  await withServer(fetchImpl, async (base) => {
    await fetch(`${base}/api/game/game-1/adventures`);
    await fetch(`${base}/api/game/game-1/adventures/ad-2/solve`, { method: 'POST' });
    await fetch(`${base}/api/game/game-1/shop`);
    await fetch(`${base}/api/game/game-1/shop/item-3/buy`, { method: 'POST' });
  });
  assert.deepEqual(calls, [
    'https://game.test/api/v2/game-1/messages',
    'https://game.test/api/v2/game-1/solve/ad-2',
    'https://game.test/api/v2/game-1/shop',
    'https://game.test/api/v2/game-1/shop/buy/item-3'
  ]);
});

test('reports malformed JSON without calling the upstream service', async () => {
  let called = false;
  const fetchImpl: typeof fetch = async () => {
    called = true;
    return fakeResponse({});
  };
  await withServer(fetchImpl, async (base) => {
    const response = await fetch(`${base}/api/game`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{'
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'Request body must be valid JSON' });
  });
  assert.equal(called, false);
});

test('returns a JSON 502 when the game service cannot be reached', async () => {
  const fetchImpl: typeof fetch = async () => { throw new Error('network failure'); };
  await withServer(fetchImpl, async (base) => {
    const response = await fetch(`${base}/api/game/g1/adventures`);
    assert.equal(response.status, 502);
    const body = await response.json() as { error: string };
    assert.match(body.error, /Could not reach game API/);
  });
});

test('returns a 502 when the upstream service responds with invalid JSON', async () => {
  const fetchImpl: typeof fetch = async () => new Response('not-json', {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
  await withServer(fetchImpl, async (base) => {
    const response = await fetch(`${base}/api/game`, { method: 'POST' });
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { error: 'Game API returned invalid JSON.' });
  });
});

test('preserves upstream error status and details', async () => {
  const fetchImpl: typeof fetch = async () => new Response(JSON.stringify({ message: 'Unknown game' }), {
    status: 404,
    headers: { 'content-type': 'application/json' }
  });
  await withServer(fetchImpl, async (base) => {
    const response = await fetch(`${base}/api/game/missing/adventures`);
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), {
      error: 'Unknown game',
      details: { message: 'Unknown game' }
    });
  });
});
