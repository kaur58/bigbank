import type { Ad, BuyResponse, ShopItem, SolveResponse, StartGameResponse } from '../types/game'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(detail || `Request failed (${response.status})`)
  }
  return response.json() as Promise<T>
}

export const gameApi = {
  start: () => request<StartGameResponse>('/api/game', { method: 'POST' }),
  adventures: (gameId: string) => request<Ad[]>(`/api/game/${encodeURIComponent(gameId)}/adventures`),
  solve: (gameId: string, adId: string) => request<SolveResponse>(
    `/api/game/${encodeURIComponent(gameId)}/adventures/${encodeURIComponent(adId)}/solve`,
    { method: 'POST' },
  ),
  shop: (gameId: string) => request<ShopItem[]>(`/api/game/${encodeURIComponent(gameId)}/shop`),
  buy: (gameId: string, itemId: string) => request<BuyResponse>(
    `/api/game/${encodeURIComponent(gameId)}/shop/${encodeURIComponent(itemId)}/buy`,
    { method: 'POST' },
  ),
}
