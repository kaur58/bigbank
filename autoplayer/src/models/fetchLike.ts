import type { FetchResponse } from './fetchResponse.js';

export type FetchLike = (
  input: string,
  init: { method: string; headers: Record<string, string>; signal: AbortSignal },
) => Promise<FetchResponse>;
