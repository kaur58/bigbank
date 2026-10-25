import type { AdsResponse } from '../models/adsResponse.js';
import type { ApiErrorOptions } from '../models/apiErrorOptions.js';
import type { ApiErrorResponse } from '../models/apiErrorResponse.js';
import type { ApiRequestOptions } from '../models/apiRequestOptions.js';
import type { FetchLike } from '../models/fetchLike.js';
import type { ShopResponse } from '../models/shopResponse.js';
import type { StartGameResponse } from '../models/startGameResponse.js';
import type { TurnResponse } from '../models/turnResponse.js';

const DEFAULT_BASE_URL = process.env.MUGLOAR_API_URL ?? 'https://dragonsofmugloar.com/api/v2';

export class ApiError extends Error {
  readonly status?: number;
  readonly endpoint?: string;
  readonly response?: ApiErrorResponse;

  constructor(message: string, { status, endpoint, cause, response }: ApiErrorOptions = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
    this.response = response;
  }
}

/** HTTP boundary for the upstream game API; accepts an injected fetch for tests. */
export class GameApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;
  private readonly timeoutMs: number;

  constructor({
    baseUrl = DEFAULT_BASE_URL,
    fetchImpl = fetch as unknown as FetchLike,
    timeoutMs = 10_000,
  }: { baseUrl?: string; fetchImpl?: FetchLike; timeoutMs?: number } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  private async request<T>(path: string, { method = 'GET' }: ApiRequestOptions = {}): Promise<T> {
    const endpoint = `${this.baseUrl}${path}`;
    let response;
    try {
      response = await this.fetchImpl(endpoint, {
        method,
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : String(cause);
      throw new ApiError(`Could not reach game API (${detail}).`, { endpoint, cause });
    }

    const body = await response.text();
    let data: unknown;
    try {
      data = body ? JSON.parse(body) : {};
    } catch (cause) {
      throw new ApiError('Game API returned invalid JSON.', { status: response.status, endpoint, cause });
    }
    if (!response.ok) {
      const errorResponse = data && typeof data === 'object' ? data as ApiErrorResponse : {};
      throw new ApiError(errorResponse.message ?? `Game API request failed with HTTP ${response.status}.`, {
        status: response.status,
        endpoint,
        response: errorResponse,
      });
    }
    return data as T;
  }

  startGame(): Promise<StartGameResponse> {
    return this.request('/game/start', { method: 'POST' });
  }
  getAds(gameId: string): Promise<AdsResponse> {
    return this.request(`/${encodeURIComponent(gameId)}/messages`);
  }
  getShop(gameId: string): Promise<ShopResponse> {
    return this.request(`/${encodeURIComponent(gameId)}/shop`);
  }
  solve(gameId: string, adId: string): Promise<TurnResponse> {
    return this.request(`/${encodeURIComponent(gameId)}/solve/${encodeURIComponent(adId)}`, { method: 'POST' });
  }
  buy(gameId: string, itemId: string): Promise<TurnResponse> {
    return this.request(`/${encodeURIComponent(gameId)}/shop/buy/${encodeURIComponent(itemId)}`, { method: 'POST' });
  }
}
