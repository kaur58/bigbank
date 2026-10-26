<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import GameOverModal from './components/GameOverModal.vue'
import GameView from './components/GameView.vue'
import ItemModal from './components/ItemModal.vue'
import LandingView from './components/LandingView.vue'
import { useGameStore } from './stores/game'
import type { Ad, ShopItem } from './types/game'

const game = useGameStore()
const selected = ref<Ad | ShopItem | null>(null)
const selectedKind = ref<'adventure' | 'shop'>('adventure')
const activeTab = ref<'adventures' | 'shop'>('adventures')
const autoplay = ref(false)
const botNote = ref('')
let botTimer: ReturnType<typeof setTimeout> | undefined

function selectAdventure(ad: Ad) {
  selected.value = ad
  selectedKind.value = 'adventure'
}
function selectItem(item: ShopItem) {
  selected.value = item
  selectedKind.value = 'shop'
}
async function startGame(withAutoplay: boolean) {
  await game.startGame()
  if (game.gameId && withAutoplay) autoplay.value = true
}
async function confirmSelection() {
  if (!selected.value) return
  const item = selected.value
  selected.value = null
  if (selectedKind.value === 'adventure') await game.solve(item as Ad)
  else await game.buy(item as ShopItem)
}
function stopAutoplay() {
  autoplay.value = false
  if (botTimer) clearTimeout(botTimer)
}
function quitGame() {
  stopAutoplay()
  game.quitGame()
}
function toggleAutoplay() {
  autoplay.value = !autoplay.value
  botNote.value = ''
}

watch([autoplay, () => game.isOver, () => game.loading], ([enabled, over, loading]) => {
  if (botTimer) clearTimeout(botTimer)
  if (!enabled || over || loading || !game.gameId) return
  botTimer = setTimeout(async () => {
    const affordable = game.shopItems.filter(item => item.cost <= game.stats.gold)
    const profitable = game.adventures.filter(ad => ad.reward > 0)
    const life = affordable.find(item => /life/i.test(item.name))
    if (game.stats.lives <= 1 && life) {
      await game.buy(life)
      botNote.value = `Autoplay bought ${life.name}.`
    } else if (profitable.length) {
      const choice = [...profitable].sort((a, b) => b.reward - a.reward)[0]
      await game.solve(choice)
      botNote.value = `Autoplay chose “${choice.message}”.`
    } else if (affordable.length) {
      const choice = [...affordable].sort((a, b) => a.cost - b.cost)[0]
      await game.buy(choice)
      botNote.value = `Autoplay bought ${choice.name}.`
    } else {
      stopAutoplay()
      botNote.value = 'Autoplay paused: no available moves.'
    }
  }, 700)
}, { immediate: true })
watch(() => game.isOver, over => { if (over) stopAutoplay() })
onBeforeUnmount(stopAutoplay)
</script>

<template>
  <main class="min-h-screen bg-forest text-parchment">
    <LandingView v-if="!game.gameId" :loading="game.loading" :error="game.error" @start="startGame" />
    <GameView v-else :stats="game.stats" :adventures="game.adventures" :shop-items="game.shopItems"
      :loading="game.loading" :error="game.error" :last-message="game.lastMessage" :autoplay="autoplay"
      :bot-note="botNote" :active-tab="activeTab" @quit="quitGame" @toggle-autoplay="toggleAutoplay"
      @select-adventure="selectAdventure" @select-item="selectItem" @dismiss-message="game.lastMessage = ''"
      @dismiss-bot-note="botNote = ''" @update-active-tab="activeTab = $event" />
    <ItemModal v-if="selected" :item="selected" :kind="selectedKind" :gold="game.stats.gold" :loading="game.loading"
      @close="selected = null" @confirm="confirmSelection" />
    <GameOverModal v-if="game.isOver" :stats="game.stats" @close="quitGame" />
  </main>
</template>
