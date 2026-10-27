<script setup lang="ts">
import StatItem from './StatItem.vue'
import type { GameStats } from '../types/game'

defineProps<{ stats: GameStats }>()

const emit = defineEmits<{ quit: [] }>()
</script>
<template>
  <header class="flex h-[75px] items-center justify-between border-b border-[#30342b]">
    <a class="flex items-center gap-2.5 font-mono text-[10px] tracking-[1.4px] text-parchment no-underline" href="#"
      @click.prevent><span class="text-lg text-gold">✦</span><span>DRAGON'S <b
          class="font-normal text-parchment-muted">MUGLOAR</b></span></a>
    <div class="flex h-full items-center gap-3 sm:gap-7">
      <div class="flex items-center gap-3 sm:gap-7">
        <StatItem icon="✧" label="SCORE" :value="stats.score" tone="text-[#d0b97f]" />
        <StatItem icon="◈" label="GOLD" :value="stats.gold" tone="text-[#c9a65f]" />
        <StatItem icon="♥" label="LIVES" :value="stats.lives" tone="text-[#bd7164]" />
      </div>

      <div class="h-6 w-px bg-[#34382f]"></div><button
        class="bg-transparent font-mono text-[9px] tracking-wider text-[#9b9c8c] hover:text-parchment"
        @click="emit('quit')"><span class="mr-1.5 text-gold">↖</span> QUIT</button>
    </div>
  </header>
</template>
