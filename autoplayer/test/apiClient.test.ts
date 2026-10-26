import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, GameApiClient } from '../src/clients/apiClient.js';
import type { FetchLike } from '../src/models/fetchLike.js';

test('encodes identifiers and parses JSON', async () => {
  let requested = '';
  const fetchImpl: FetchLike = async url => {
    requested = url;
    return new Response('[{"adId":"a"}]', { status: 200 });
  };
  const api = new GameApiClient({ fetchImpl });
  assert.deepEqual(await api.getAds('game id'), [{ adId: 'a' }]);
  assert.match(requested, /game%20id\/messages$/);
});

test('normalizes wrapped ads and shop responses to typed arrays', async () => {
  const responses = [
    new Response('{"adventures":[{"adId":"a","message":"Quest","reward":10,"expiresIn":2,"probability":"Sure thing"}]}', { status: 200 }),
    new Response('{"shoppingList":[{"id":"hpot","name":"Healing Potion","cost":50}]}', { status: 200 }),
  ];
  const fetchImpl: FetchLike = async () => responses.shift()!;
  const api = new GameApiClient({ fetchImpl });

  assert.deepEqual((await api.getAds('g1')).map(ad => ad.adId), ['a']);
  assert.deepEqual((await api.getShop('g1')).map(item => item.id), ['hpot']);
});

test('accepts each documented ads and shop wrapper key', async () => {
  const responses = [
    new Response('{"ads":[{"adId":"a"}]}', { status: 200 }),
    new Response('{"messages":[{"adId":"b"}]}', { status: 200 }),
    new Response('{"shop":[{"id":"s1","name":"Item","cost":1}]}', { status: 200 }),
  ];
  const api = new GameApiClient({ fetchImpl: async () => responses.shift()! });

  assert.deepEqual((await api.getAds('g1')).map(ad => ad.adId), ['a']);
  assert.deepEqual((await api.getAds('g1')).map(ad => ad.adId), ['b']);
  assert.deepEqual((await api.getShop('g1')).map(item => item.id), ['s1']);
});

test('maps upstream HTTP errors to ApiError and preserves the response body', async () => {
  const fetchImpl: FetchLike = async () => new Response('{"message":"ended"}', { status: 410 });
  const api = new GameApiClient({ fetchImpl });
  await assert.rejects(api.startGame(), error => error instanceof ApiError && error.status === 410 && error.message === 'ended' && error.response?.message === 'ended');
});

test('reports malformed response JSON and invalid list wrappers as ApiErrors', async () => {
  const malformedJson = new GameApiClient({
    fetchImpl: async () => new Response('not-json', { status: 200 }),
  });
  await assert.rejects(malformedJson.getAds('g1'), error => error instanceof ApiError && error.message.includes('invalid JSON'));

  const malformedWrapper = new GameApiClient({
    fetchImpl: async () => new Response('{}', { status: 200 }),
  });
  await assert.rejects(malformedWrapper.getAds('g1'), error => error instanceof ApiError && error.message.includes('invalid ads response'));
});

test('maps network failures to ApiError', async () => {
  const api = new GameApiClient({
    fetchImpl: async () => { throw new TypeError('offline'); },
  });
  await assert.rejects(api.getShop('g1'), error => error instanceof ApiError && error.message.includes('offline'));
});

test('uses the documented paths and POST methods for game actions', async () => {
  const requests: Array<{ url: string; method: string }> = [];
  const fetchImpl: FetchLike = async (url, init) => {
    requests.push({ url, method: init.method });
    return new Response('{}', { status: 200 });
  };
  const api = new GameApiClient({ baseUrl: 'https://example.test/api/v2', fetchImpl });

  await api.startGame();
  await api.solve('game id', 'ad/id');
  await api.buy('game id', 'hp ot');

  assert.deepEqual(requests, [
    { url: 'https://example.test/api/v2/game/start', method: 'POST' },
    { url: 'https://example.test/api/v2/game%20id/solve/ad%2Fid', method: 'POST' },
    { url: 'https://example.test/api/v2/game%20id/shop/buy/hp%20ot', method: 'POST' },
  ]);
});
