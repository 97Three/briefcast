<template>
  <nav
    class="fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-4 no-print xl:flex"
    :aria-label="tr('章节导航', 'Section navigation')"
  >
    <!-- 阅读进度：transform 缩放，不触发重排 -->
    <div class="relative h-32 w-px overflow-hidden bg-white/10">
      <span
        class="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-cyber-blue to-cyber-purple transition-transform duration-150"
        :style="{ transform: `scaleY(${progress})` }"
        aria-hidden="true"
      ></span>
    </div>

    <ul class="flex flex-col items-end gap-2.5">
      <li v-for="section in sections" :key="section.id">
        <button
          class="group flex items-center gap-2 py-0.5"
          :aria-current="activeId === section.id ? 'true' : undefined"
          @click="goTo(section.id)"
        >
          <span
            class="whitespace-nowrap text-[11px] transition-opacity duration-200"
            :class="activeId === section.id ? 'text-text-secondary opacity-100' : 'text-text-tertiary opacity-0 group-hover:opacity-100'"
          >
            {{ section.label }}
          </span>
          <span
            class="h-1.5 w-1.5 rounded-full transition-all duration-200"
            :class="activeId === section.id ? 'bg-cyber-blue shadow-[0_0_10px_rgba(85,195,231,0.7)] scale-125' : 'bg-white/25 group-hover:bg-white/45'"
          ></span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { tr } from '../composables/useLocale'

const props = defineProps<{
  sections: { id: string; label: string }[]
}>()

const activeId = ref('')
const progress = ref(0)

let observer: IntersectionObserver | null = null
let frame = 0

function updateProgress() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    const scrollable = document.documentElement.scrollHeight - window.innerHeight
    progress.value = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0
  })
}

onMounted(() => {
  updateProgress()
  window.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', updateProgress)

  if (typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(
    (entries) => {
      // 取当前视口内最靠近上方的那一节作为高亮项
      const visible = entries.filter((entry) => entry.isIntersecting)
      if (visible.length === 0) return
      const topMost = visible.reduce((a, b) => (a.boundingClientRect.top <= b.boundingClientRect.top ? a : b))
      activeId.value = topMost.target.id
    },
    { rootMargin: '-15% 0px -55% 0px', threshold: 0 }
  )

  for (const section of props.sections) {
    const element = document.getElementById(section.id)
    if (element) observer.observe(element)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateProgress)
  window.removeEventListener('resize', updateProgress)
  observer?.disconnect()
  if (frame) cancelAnimationFrame(frame)
})

function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  activeId.value = id
}
</script>
