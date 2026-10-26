<script setup lang="ts">
import type { ShopItem } from '../types/game'
defineProps<{ item: ShopItem; disabled?: boolean }>()
defineEmits<{ select: [item: ShopItem] }>()
function iconFor(name: string) {
  if (/life|heart/i.test(name)) return '♥'
  if (/shield|armor/i.test(name)) return '⬡'
  if (/sword|weapon/i.test(name)) return '⚔'
  return '✧'
}
function descriptionFor(name: string) {
  return /life|heart/i.test(name) ? 'A little more time in the realm.' : 'A useful companion on the road.'
}
</script>
<template>
  <button
    class="group flex w-full items-center gap-3 border-b border-[#2a3027] bg-transparent px-1 py-4 text-left transition hover:bg-[#1c221a]"
    :disabled="disabled" @click="$emit('select', item)">
    <span class="grid h-[35px] w-[35px] shrink-0 place-items-center border border-[#414337] text-lg text-gold">{{
      iconFor(item.name) }}</span>
    <span class="min-w-0 flex-1"><strong class="block text-xs font-medium text-[#e3e1d5]">{{ item.name }}</strong><small
        class="mt-1 block text-[10px] text-[#828577]">{{ descriptionFor(item.name) }}</small></span>
    <span class="min-w-[55px] text-right"><b class="font-mono text-xs text-gold-soft">{{ item.cost }}</b><small
        class="mt-0.5 block font-mono text-[8px] tracking-widest text-[#828477]">GOLD</small></span>
    <span class="text-[#777b6e] opacity-0 transition group-hover:opacity-100">↗</span>
  </button>
</template>
