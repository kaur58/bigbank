import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { gameApi } from '../services/api'
import type { Ad, GameStats, ShopItem } from '../types/game'

export const useGameStore = defineStore('game', () => {
  const gameId = ref<string | null>(null)
  const stats = ref<GameStats>({ lives: 0, gold: 0, level: 1, score: 0, highScore: 0, turn: 0 })
  const adventures = ref<Ad[]>([])
  const shopItems = ref<ShopItem[]>([])
  const loading = ref(false)
  const error = ref('')
  const lastMessage = ref('')
  const isOver = computed(() => !!gameId.value && stats.value.lives <= 0)

  function setStats(next: Partial<GameStats>) {
    stats.value = { ...stats.value, ...next }
  }

  async function refreshLists() {
    if (!gameId.value) return
    const [ads, items] = await Promise.all([
      gameApi.adventures(gameId.value),
      gameApi.shop(gameId.value),
    ])
    adventures.value = ads
    shopItems.value = items
  }

  async function startGame() {
    loading.value = true
    error.value = ''
    lastMessage.value = ''
    try {
      const result = await gameApi.start()
      gameId.value = result.gameId
      setStats(result)
      await refreshLists()
    } catch (cause) {
      gameId.value = null
      error.value = cause instanceof Error ? cause.message : 'Could not start a game.'
    } finally {
      loading.value = false
    }
  }

  async function solve(adventure: Ad) {
    if (!gameId.value) return
    loading.value = true
    error.value = ''
    try {
      const result = await gameApi.solve(gameId.value, adventure.adId)
      setStats(result)
      lastMessage.value = result.message
      await refreshLists()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Could not solve this adventure.'
    } finally {
      loading.value = false
    }
  }

  async function buy(item: ShopItem) {
    if (!gameId.value) return
    loading.value = true
    error.value = ''
    try {
      const result = await gameApi.buy(gameId.value, item.id)
      setStats(result)
      lastMessage.value = result.shoppingSuccess ? `${item.name} added to your pack.` : `Couldn't buy ${item.name}.`
      await refreshLists()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Could not buy this item.'
    } finally {
      loading.value = false
    }
  }

  function quitGame() {
    gameId.value = null
    adventures.value = []
    shopItems.value = []
    error.value = ''
    lastMessage.value = ''
  }

  return { gameId, stats, adventures, shopItems, loading, error, lastMessage, isOver, startGame, solve, buy, quitGame }
})
