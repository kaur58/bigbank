import type { ApiErrorResponse } from './apiErrorResponse.js';

export interface ApiErrorOptions {
  status?: number;
  endpoint?: string;
  cause?: unknown;
  response?: ApiErrorResponse;
}
