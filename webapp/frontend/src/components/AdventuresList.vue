<script setup lang="ts">
import type { Ad } from '../types/game'
import AdventureItem from './AdventureItem.vue'
defineProps<{ adventures: Ad[]; disabled?: boolean; hidden?: boolean }>()
defineEmits<{ select: [adventure: Ad] }>()
</script>
<template>
  <section class="flex min-h-[400px] flex-col border border-[#34382e] bg-[#151a16] px-5 pt-6"
    :class="{ 'hidden md:flex': hidden }">
    <div class="mb-5 flex items-start justify-between">
      <div>
        <div class="flex items-center gap-2 font-mono text-[9px] tracking-widest text-[#929484]"><span
            class="text-sm text-gold">⚒</span> THE NOTICEBOARD</div>
        <h3 class="mt-2 font-display text-2xl font-medium">Adventures <span
            class="ml-1 align-middle font-mono text-[10px] text-[#8e907f]">{{ adventures.length }}</span></h3>
      </div>
      <div class="text-right font-mono text-[8px] leading-relaxed tracking-wide text-[#777a6d]">CHOOSE
        YOUR<br />CHALLENGE</div>
    </div>
    <div
      class="grid grid-cols-[1fr_75px] border-y border-[#30352b] px-1 py-3 font-mono text-[8px] tracking-widest text-[#777b6e]">
      <span>QUEST DETAILS</span><span class="text-right">REWARD</span></div>
    <div v-if="!adventures.length"
      class="grid min-h-[135px] flex-1 place-content-center text-center text-xs text-[#777b6e]"><span
        class="text-2xl text-gold">✧</span>
      <p>No quests on the board right now.</p>
    </div>
    <AdventureItem v-for="(ad, index) in adventures" :key="ad.adId" :adventure="ad" :index="index" :disabled="disabled"
      @select="$emit('select', $event)" />
    <div class="mt-auto py-4 font-mono text-[8px] tracking-wide text-[#787b6e]"><span class="mr-1 text-gold">✦</span>
      FORTUNE FAVOURS THE BOLD</div>
  </section>
</template>
