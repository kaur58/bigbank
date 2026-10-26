export const DEFAULT_BASE_URL = 'https://dragonsofmugloar.com/api/v2';

export interface ApiErrorOptions {
  status?: number;
  endpoint?: string;
  cause?: unknown;
  response?: ApiErrorResponse;
}

export interface ApiErrorResponse {
  message?: string;
  [key: string]: unknown;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST';
}

export interface StartGameResponse {
  gameId: string;
  lives: number;
  gold: number;
  level: number;
  score: number;
  highScore: number;
  turn: number;
}

export interface Ad {
  adId: string;
  message: string;
  reward: number;
  expiresIn: number;
  encrypted?: string | number;
  probability: string;
}

export interface ShopItem {
  id: string;
  name: string;
  cost: number;
}

export interface SolveResponse {
  success: boolean;
  lives: number;
  gold: number;
  level: number;
  score: number;
  highScore: number;
  turn: number;
  message: string;
}

export interface BuyResponse {
  shoppingSuccess: boolean;
  lives: number;
  gold: number;
  level: number;
  turn: number;
}

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

export interface GameApiClient {
  startGame(): Promise<StartGameResponse>;
  getAds(gameId: string): Promise<Ad[]>;
  getShop(gameId: string): Promise<ShopItem[]>;
  solve(gameId: string, adId: string): Promise<SolveResponse>;
  buy(gameId: string, itemId: string): Promise<BuyResponse>;
}

export class DragonsApiUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('The game service is unavailable', { cause });
    this.name = 'DragonsApiUnavailableError';
  }
}

export interface DragonsApiClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export class DragonsApiClient implements GameApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor({ baseUrl = DEFAULT_BASE_URL, fetchImpl = globalThis.fetch }: DragonsApiClientOptions = {}) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.fetchImpl = fetchImpl;
  }

  private async request<T>(path: string, { method = 'GET' }: ApiRequestOptions = {}): Promise<T> {
    const endpoint = `${this.baseUrl}${path}`;
    let response;
    try {
      response = await this.fetchImpl(endpoint, {
        method,
        headers: { accept: 'application/json' },
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

  async getAds(gameId: string): Promise<Ad[]> {
    return await this.request<Ad[]>(`/${encodeURIComponent(gameId)}/messages`);
  }

  async getShop(gameId: string): Promise<ShopItem[]> {
    return await this.request<ShopItem[]>(`/${encodeURIComponent(gameId)}/shop`);
  }

  solve(gameId: string, adId: string): Promise<SolveResponse> {
    return this.request(`/${encodeURIComponent(gameId)}/solve/${encodeURIComponent(adId)}`, { method: 'POST' });
  }

  buy(gameId: string, itemId: string): Promise<BuyResponse> {
    return this.request(`/${encodeURIComponent(gameId)}/shop/buy/${encodeURIComponent(itemId)}`, { method: 'POST' });
  }
}
