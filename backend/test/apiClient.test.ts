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

test('maps upstream HTTP errors to ApiError and preserves the response body', async () => {
  const fetchImpl: FetchLike = async () => new Response('{"message":"ended"}', { status: 410 });
  const api = new GameApiClient({ fetchImpl });
  await assert.rejects(api.startGame(), error => error instanceof ApiError && error.status === 410 && error.message === 'ended' && error.response?.message === 'ended');
});
