export interface ApiErrorOptions {
  status?: number;
  endpoint?: string;
  cause?: unknown;
  response?: import('./apiErrorResponse.js').ApiErrorResponse;
}
