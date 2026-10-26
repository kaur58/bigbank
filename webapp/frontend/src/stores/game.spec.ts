import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from './game'

vi.mock('../services/api', () => ({
  gameApi: {
    start: vi.fn().mockResolvedValue({ gameId: 'g1', lives: 3, gold: 10, level: 1, score: 0, highScore: 0, turn: 0 }),
    adventures: vi.fn().mockResolvedValue([]),
    shop: vi.fn().mockResolvedValue([]),
    solve: vi.fn(),
    buy: vi.fn(),
  },
}))

describe('game store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('starts a game and loads its lists', async () => {
    const store = useGameStore()
    await store.startGame()
    expect(store.gameId).toBe('g1')
    expect(store.stats.lives).toBe(3)
    expect(store.isOver).toBe(false)
  })

  it('clears the active game when quitting', async () => {
    const store = useGameStore()
    await store.startGame()
    store.quitGame()
    expect(store.gameId).toBeNull()
  })
})
