<template>
  <span class="tabular-nums">{{ shown }}</span>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    duration?: number
  }>(),
  { duration: 620 }
)

const shown = ref(0)
let frame = 0

function reduced(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function animate(from: number, to: number) {
  if (reduced()) {
    shown.value = to
    return
  }
  if (frame) cancelAnimationFrame(frame)
  const start = performance.now()
  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / props.duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    shown.value = Math.round(from + (to - from) * eased)
    if (progress < 1) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
}

// 首次渲染就滚一次，避免出现 0 → 目标值的跳变
animate(0, props.value)

watch(
  () => props.value,
  (to, from) => animate(from ?? 0, to)
)
</script>
