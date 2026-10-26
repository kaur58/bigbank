<script setup lang="ts">
import type { ShopItem } from '../types/game'
import ShopItemCard from './ShopItemCard.vue'
defineProps<{ items: ShopItem[]; gold: number; disabled?: boolean; hidden?: boolean }>()
defineEmits<{ select: [item: ShopItem] }>()
</script>
<template>
  <section class="flex min-h-[400px] flex-col border border-[#34382e] bg-[#151a16] px-5 pt-6"
    :class="{ 'hidden md:flex': hidden }">
    <div class="mb-5 flex items-start justify-between">
      <div>
        <div class="flex items-center gap-2 font-mono text-[9px] tracking-widest text-[#929484]"><span
            class="text-base text-gold">⌂</span> TRAVELER'S REST</div>
        <h3 class="mt-2 font-display text-2xl font-medium">Supply shop <span
            class="ml-1 align-middle font-mono text-[10px] text-[#8e907f]">{{ items.length }}</span></h3>
      </div>
      <div class="text-right font-mono text-[8px] leading-relaxed tracking-wide text-[#777a6d]">SPEND
        WISELY<br />TRAVELER</div>
    </div>
    <div
      class="mb-px flex items-center justify-between border-y border-[#30352b] px-1 py-3 font-mono text-[8px] tracking-widest text-[#797d70]">
      <span>YOUR PURSE</span>
      <strong class="text-xs text-gold-soft"><i class="not-italic">◈</i> {{ gold }} <small
          class="ml-1 text-[8px] text-[#898b7f]">GOLD</small></strong>
    </div>
    <div v-if="!items.length" class="grid min-h-[135px] flex-1 place-content-center text-center text-xs text-[#777b6e]">
      <span class="text-2xl text-gold">◈</span>
      <p>Nothing for sale at the moment.</p>
    </div>
    <ShopItemCard v-for="item in items" :key="item.id" :item="item" :disabled="disabled"
      @select="$emit('select', $event)" />
    <div class="mt-auto py-4 font-mono text-[8px] tracking-wide text-[#787b6e]"><span class="mr-1 text-gold">✦</span> A
      CLEVER INVESTMENT CAN CHANGE EVERYTHING.</div>
  </section>
</template>
