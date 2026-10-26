<script setup lang="ts">
import { computed } from 'vue'
import type { Ad, ShopItem } from '../types/game'

const props = defineProps<{ item: Ad | ShopItem; kind: 'adventure' | 'shop'; gold: number; loading: boolean }>()
const emit = defineEmits<{ close: []; confirm: [] }>()
const isAdventure = computed(() => props.kind === 'adventure')
const adventure = computed(() => props.item as Ad)
const shopItem = computed(() => props.item as ShopItem)
const disabled = computed(() => props.loading || (!isAdventure.value && props.gold < shopItem.value.cost))
function probabilityLabel(value: number) {
  return Number.isFinite(value) && value <= 1 ? `${Math.round(value * 100)}%` : value
}
</script>

<template>
  <div class="fixed inset-0 z-10 grid place-items-center bg-black/80 p-5 backdrop-blur-sm" @click.self="emit('close')"
    @keydown.esc="emit('close')">
    <section class="relative w-full max-w-[480px] border border-[#53513d] bg-forest-800 px-6 py-8 shadow-2xl sm:px-10"
      role="dialog" aria-modal="true" :aria-label="isAdventure ? 'Adventure details' : 'Shop item details'">
      <button class="absolute right-4 top-3 bg-transparent text-2xl text-[#9c9d8c]" aria-label="Close dialog"
        @click="emit('close')">×</button>
      <div class="mb-6 grid h-[46px] w-[46px] place-items-center border border-[#665b3e] text-xl text-gold">{{
        isAdventure ? '⚒' : '✧' }}</div>
      <div class="flex items-center gap-2.5 font-mono text-[10px] tracking-widest text-[#aaa994]"><span
          class="h-1.5 w-1.5 rounded-full bg-gold"></span>{{ isAdventure ? 'A NEW ADVENTURE' : 'FROM THE SUPPLY SHOP' }}
      </div>
      <h2 class="my-3 font-display text-3xl font-medium leading-tight text-[#f0ecdf]">{{ isAdventure ? adventure.message
        : shopItem.name }}</h2>
      <template v-if="isAdventure">
        <p class="my-3 mb-5 text-[13px] leading-relaxed text-[#a8a999]">A chance to earn <strong
            class="font-medium text-gold-soft">{{ adventure.reward }} gold</strong>. Tread carefully: this
          opportunity expires in {{ adventure.expiresIn }} turns.</p>
        <div class="mb-6 grid grid-cols-2 border-y border-[#35392e] py-4">
          <div><small class="mb-2 block font-mono text-[8px] tracking-widest text-[#818475]">REWARD</small><b
              class="font-mono text-[10px] text-[#d1bf95]">◈ {{ adventure.reward }} GOLD</b></div>
          <div><small class="mb-2 block font-mono text-[8px] tracking-widest text-[#818475]">SUCCESS CHANCE</small><b
              class="font-mono text-[10px] text-[#d1bf95]">{{ adventure.probability }} ({{
                probabilityLabel(adventure.successProbability) }})</b>
          </div>
        </div>
      </template>
      <template v-else>
        <p class="my-3 mb-5 text-[13px] leading-relaxed text-[#a8a999]">A useful bit of kit for the journey ahead. Make
          sure you can cover the cost before
          purchasing.</p>
        <div class="mb-6 grid grid-cols-2 border-y border-[#35392e] py-4">
          <div><small class="mb-2 block font-mono text-[8px] tracking-widest text-[#818475]">PRICE</small><b
              class="font-mono text-[10px] text-[#d1bf95]">◈ {{ shopItem.cost }} GOLD</b></div>
          <div><small class="mb-2 block font-mono text-[8px] tracking-widest text-[#818475]">YOUR PURSE</small><b
              class="font-mono text-[10px] text-[#d1bf95]">◈ {{ gold }} GOLD</b></div>
        </div>
      </template>
      <div class="flex justify-end gap-2.5">
        <button
          class="border border-[#414538] bg-transparent px-4 py-3.5 font-mono text-[10px] tracking-wider text-[#a8a999]"
          @click="emit('close')">CANCEL</button>
        <button
          class="flex items-center gap-5 bg-gold px-4 py-3.5 font-mono text-[10px] tracking-wider text-[#191a13] hover:bg-[#dcc18e]"
          :disabled="disabled" @click="emit('confirm')">
          {{ loading ? 'PLEASE WAIT…' : isAdventure ? 'TAKE THE QUEST' : 'BUY ITEM' }} <span>↗</span>
        </button>
      </div>
    </section>
  </div>
</template>
