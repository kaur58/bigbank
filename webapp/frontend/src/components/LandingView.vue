<script setup lang="ts">
defineProps<{ loading: boolean; error: string }>()
const emit = defineEmits<{ start: [autoplay: boolean] }>()
</script>

<template>
  <section class="relative grid min-h-screen overflow-hidden bg-forest-900 md:grid-cols-2">
    <div
      class="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_49%,#4b5334_0%,#272f25_31%,#171f1b_66%,#131916_100%)] opacity-40 md:relative md:opacity-100"
      aria-hidden="true">
      <div
        class="absolute left-1/2 top-1/4 h-44 w-44 -translate-x-1/2 rounded-full bg-[#c6a775]/80 shadow-[0_0_80px_#c0a16a66]">
      </div>
      <div
        class="absolute -bottom-4 -left-[5%] h-[61%] w-[115%] bg-[#353e2c] [clip-path:polygon(0_100%,0_66%,15%_51%,22%_63%,37%_23%,52%_60%,65%_34%,75%_53%,86%_26%,100%_66%,100%_100%)]">
      </div>
      <div
        class="absolute -bottom-1 -left-[5%] h-[47%] w-[115%] bg-gradient-to-br from-[#29342a] to-[#1a211c] [clip-path:polygon(0_100%,0_53%,18%_35%,31%_64%,48%_20%,64%_60%,80%_31%,100%_64%,100%_100%)]">
      </div>
      <div
        class="absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2 scale-x-[-1] text-[clamp(100px,18vw,250px)] grayscale brightness-50 sepia">
        🐉</div>
      <div class="absolute left-1/4 top-[21%] text-sm tracking-[18px] text-[#ddd1ae]">✦　·　✧　　 ·　✦</div>
    </div>
    <div
      class="relative z-10 flex min-h-screen flex-col items-start justify-center px-[9vw] py-16 md:px-[6vw] lg:pl-[10vw]">
      <div class="flex items-center gap-2.5 font-mono text-[10px] tracking-[1.65px] text-parchment-muted"><span
          class="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_10px_#d7ad61]"></span> A TEXT-BASED ADVENTURE</div>
      <h1
        class="mb-[22px] mt-8 font-display text-[clamp(64px,7.5vw,110px)] font-semibold leading-[.95] tracking-[-4px] text-[#f1ede1]">
        Dragon's<br /><em class="font-medium text-gold">Mugloar</em></h1>
      <p class="mb-8 max-w-[345px] text-[15px] leading-[1.8] text-[#aaa99b]">The kingdom is in trouble. The quests are
        questionable. The rewards are real enough.</p>
      <button
        class="flex min-w-[250px] items-center justify-between gap-8 bg-gold px-5 py-[17px] font-mono text-[10px] tracking-[1.1px] text-[#191a13] transition hover:-translate-y-0.5 hover:bg-[#dcc18e]"
        :disabled="loading" @click="emit('start', false)">
        <span>{{ loading ? 'Preparing your quest…' : 'Begin your adventure' }}</span>
        <span aria-hidden="true">↗</span>
      </button>
      <button class="mt-4 bg-transparent py-2 text-xs text-[#8f9183] hover:text-[#d3bd91]" :disabled="loading"
        @click="emit('start', true)">or let the autoplayer take the reins</button>
      <p v-if="error" class="mt-4 border border-[#76483e] bg-[#351f1c] px-3.5 py-3 text-xs text-[#e7a294]">{{ error }}
      </p>
    </div>
  </section>
</template>
