<script setup lang="ts">
import type { GameStats } from '../types/game'
defineProps<{ stats: GameStats }>()
defineEmits<{ close: [] }>()
</script>
<template>
  <div class="fixed inset-0 z-20 overflow-y-auto bg-black/80 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-5">
    <section
      class="min-h-screen w-full overflow-y-auto border-0 bg-forest-800 px-6 pb-8 pt-12 text-center shadow-2xl sm:min-h-0 sm:max-h-[calc(100dvh-2.5rem)] sm:w-full sm:max-w-[480px] sm:border sm:px-10 sm:py-8"
      role="dialog" aria-modal="true" aria-labelledby="game-over-title">
      <div
        class="mx-auto mb-5 grid h-[46px] w-[46px] place-items-center border border-[#65443a] font-display text-2xl text-[#b97c68]">
        †</div>
      <div class="flex justify-center items-center gap-2.5 font-mono text-[10px] tracking-widest text-[#aaa994]"><span
          class="h-1.5 w-1.5 rounded-full bg-gold"></span> YOUR JOURNEY ENDS HERE</div>
      <h2 id="game-over-title" class="my-3 font-display text-3xl font-medium text-[#f0ecdf]">The realm remembers.</h2>
      <p class="my-3 mb-5 text-[13px] leading-relaxed text-[#a8a999]">You gave Mugloar everything you had. Every
        adventurer leaves a story behind.</p>
      <div class="py-4"><small class="mb-1 block font-mono text-[8px] tracking-widest text-[#818475]">FINAL
          SCORE</small><strong class="font-display text-6xl text-gold-soft">{{ stats.score }}</strong></div>
      <div class="mb-6 grid grid-cols-2 border-y border-[#35392e] py-4">
        <div><small class="mb-2 block font-mono text-[8px] tracking-widest text-[#818475]">GOLD</small><b
            class="font-mono text-[10px] text-[#d4c59a]">◈ {{ stats.gold }}</b></div>
        <div><small class="mb-2 block font-mono text-[8px] tracking-widest text-[#818475]">LIVES</small><b
            class="font-mono text-[10px] text-[#d4c59a]">{{ stats.lives }}</b></div>
      </div>
      <button
        class="flex w-full items-center justify-between bg-gold px-5 py-[17px] font-mono text-[10px] tracking-wider text-[#191a13] hover:bg-[#dcc18e]"
        @click="$emit('close')">RETURN TO THE REALM <span>↗</span></button>
    </section>
  </div>
</template>
