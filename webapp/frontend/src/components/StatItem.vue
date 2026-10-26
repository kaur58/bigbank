<script setup lang="ts">
defineProps<{ icon: string; label: string; value: number; tone: string }>()
</script>
<template>
    <div class="flex items-center gap-2">
        <span class="text-[17px]" :class="tone">{{ icon }}</span>
        <span>
            <small class="mb-0.5 block font-mono text-[8px] tracking-widest text-[#828477]">{{ label }}</small>
            <strong class="font-mono text-sm text-parchment">{{ value }}</strong>
        </span>
    </div>
</template>
