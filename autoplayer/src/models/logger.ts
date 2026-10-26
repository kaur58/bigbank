export interface Logger {
  info(...data: unknown[]): void;
  error?(...data: unknown[]): void;
}
