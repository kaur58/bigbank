<script setup lang="ts">
import type { Ad, GameStats, ShopItem } from '../types/game'
import AdventuresList from './AdventuresList.vue'
import GameHeader from './GameHeader.vue'
import ShopList from './ShopList.vue'

defineProps<{
  stats: GameStats
  adventures: Ad[]
  shopItems: ShopItem[]
  loading: boolean
  error: string
  lastMessage: string
  autoplay: boolean
  botNote: string
  activeTab: 'adventures' | 'shop'
}>()

const emit = defineEmits<{
  quit: []
  toggleAutoplay: []
  selectAdventure: [ad: Ad]
  selectItem: [item: ShopItem]
  dismissMessage: []
  dismissBotNote: []
  updateActiveTab: [tab: 'adventures' | 'shop']
}>()
</script>

<template>
  <section class="mx-auto max-w-[1500px] px-[5vw] sm:px-[6.2vw]">
    <GameHeader :stats="stats" @quit="emit('quit')" />

    <div class="flex items-end justify-between gap-3 py-8 sm:pb-[30px] sm:pt-[46px]">
      <div>
        <h2 class="mt-3 font-display text-[34px] font-medium leading-tight tracking-tight text-[#f0ecdf] sm:text-5xl">
          Your next move.</h2>
      </div>
      <div class="flex flex-col-reverse items-end gap-2 sm:flex-row sm:items-center sm:gap-5">
        <div class="font-mono text-[9px] tracking-widest text-[#818475]">TURN <b
            class="ml-1.5 font-normal text-[#d0be98]">{{ String(stats.turn).padStart(3, '0') }}</b></div>
        <button
          class="flex items-center gap-2 border border-[#45483a] bg-[#1a1e18] px-3.5 py-3 font-mono text-[9px] tracking-wider text-[#c9c6b7] hover:border-gold hover:text-[#e8d5aa]"
          :class="{ 'border-gold text-[#e8d5aa]': autoplay }" @click="emit('toggleAutoplay')"><span class="text-gold">{{
            autoplay ? 'Ⅱ' : '▶' }}</span> {{ autoplay ? 'PAUSE AUTOPLAY' : 'AUTOPLAY' }}</button>
      </div>
    </div>
    <div v-if="error" class="mb-3 border border-[#76483e] bg-[#351f1c] px-3.5 py-3 text-xs text-[#e7a294]">
      {{ error }}
    </div>

    <div v-if="lastMessage"
      class="mb-2 flex items-center gap-2 border border-[#444632] bg-[#20251b] p-3 text-xs text-[#d7c89e]">
      <span>✦</span> {{ lastMessage }}<button aria-label="Dismiss message" class="ml-auto bg-transparent text-lg"
        @click="emit('dismissMessage')">×</button>
    </div>

    <div v-if="botNote"
      class="mb-2 flex items-center gap-2 border border-[#444632] bg-[#20251b] p-3 text-xs text-[#b8bcaa]"><span
        class="h-1.5 w-1.5 rounded-full bg-[#a6b27c]"></span>{{ botNote }}<button class="ml-auto bg-transparent text-lg"
        aria-label="Dismiss message" @click="emit('dismissBotNote')">×</button></div>

    <nav class="mb-3 grid grid-cols-2 border-b border-[#34382e] md:hidden" aria-label="Game sections">
      <button
        class="border-b-2 border-transparent bg-transparent py-3.5 font-mono text-[9px] tracking-wide text-[#858778]"
        :class="{ 'border-gold text-parchment': activeTab === 'adventures' }"
        @click="emit('updateActiveTab', 'adventures')">ADVENTURES <b class="ml-1 font-normal text-gold">{{
          adventures.length }}</b></button>
      <button
        class="border-b-2 border-transparent bg-transparent py-3.5 font-mono text-[9px] tracking-wide text-[#858778]"
        :class="{ 'border-gold text-parchment': activeTab === 'shop' }" @click="emit('updateActiveTab', 'shop')">THE
        SHOP <b class="ml-1 font-normal text-gold">{{
          shopItems.length }}</b></button>
    </nav>

    <div class="grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 md:gap-[18px]">
      <AdventuresList :adventures="adventures" :disabled="loading || autoplay" :hidden="activeTab !== 'adventures'"
        @select="emit('selectAdventure', $event)" />
      <ShopList :items="shopItems" :gold="stats.gold" :disabled="loading || autoplay" :hidden="activeTab !== 'shop'"
        @select="emit('selectItem', $event)" />
    </div>
  </section>
</template>
