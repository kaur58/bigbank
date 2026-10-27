<script setup lang="ts">
import type { Ad } from '../types/game'

defineProps<{ adventure: Ad; index: number; disabled?: boolean }>()
defineEmits<{ select: [adventure: Ad] }>()

function probabilityLabel(value: number) {
  const number = Number(value)
  return Number.isFinite(number) && number <= 1 ? `${Math.round(number * 100)}%` : value
}
</script>
<template>
  <button
    class="group flex w-full items-center gap-3 border-b border-[#2a3027] bg-transparent px-1 py-4 text-left transition hover:bg-[#1c221a]"
    :disabled="disabled" @click="$emit('select', adventure)">
    <span class="min-w-5 font-mono text-[9px] text-[#737869]">{{ String(index + 1).padStart(2, '0') }}</span>
    <span class="min-w-0 flex-1">
      <strong class="block text-xs font-medium leading-relaxed text-[#e3e1d5]">{{ adventure.message }}</strong>
      <small class="mt-1.5 block font-mono text-[8px] tracking-wide text-[#828577]">EXPIRES IN {{ adventure.expiresIn }}
        TURNS <i class="text-gold not-italic">·</i> {{ probabilityLabel(adventure.successProbability) }}
        CHANCE</small>
    </span>
    <span class="min-w-[55px] text-right"><b class="font-mono text-sm text-gold-soft">+{{ adventure.reward }}</b><small
        class="mt-0.5 block font-mono text-[8px] tracking-widest text-[#828477]">GOLD</small></span>
    <span class="text-[#777b6e] opacity-0 transition group-hover:opacity-100">↗</span>
  </button>
</template>
