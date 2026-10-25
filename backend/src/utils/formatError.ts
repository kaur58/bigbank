import { ApiError } from '../clients/apiClient.js';

export function formatError(error: unknown): string {
  if (error instanceof ApiError) {
    return `${error.message}${error.status ? ` (HTTP ${error.status})` : ''}`;
  }
  return error instanceof Error ? error.message : String(error);
}
