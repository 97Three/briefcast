<template>
  <transition
    enter-active-class="transition-opacity duration-150"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="pointer-events-none fixed z-[60] w-80 no-print"
      :style="{ left: `${x}px`, top: `${y}px` }"
      role="tooltip"
    >
      <div class="rounded-lg border border-cyber-blue/25 bg-dark-card/95 p-3 shadow-[0_18px_50px_rgba(2,8,17,0.55)] backdrop-blur">
        <p class="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-cyber-blue">
          <span class="font-mono">{{ sourceId }}</span>
          <span class="text-text-tertiary">{{ tr('原文摘录', 'Original quote') }}</span>
        </p>
        <p class="line-clamp-4 text-[13px] leading-relaxed text-text-primary">“{{ quote }}”</p>
        <p class="mt-2 border-t border-white/[0.07] pt-2 text-[11px] leading-snug text-text-tertiary">
          {{ title }}
        </p>
        <p class="mt-0.5 font-mono text-[11px] text-text-tertiary">{{ published }}</p>
        <p class="mt-1.5 text-[10px] text-text-tertiary/80">
          {{ tr('点击可展开完整来源', 'Click to open the full source') }}
        </p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { tr } from '../composables/useLocale'

defineProps<{
  open: boolean
  x: number
  y: number
  sourceId: string
  quote: string
  title: string
  published: string
}>()
</script>
