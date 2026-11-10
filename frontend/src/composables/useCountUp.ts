import { onMounted, ref } from 'vue'
import type { Ref } from 'vue'

/** 从 0 缓动到目标值，只改文本，不动布局；减弱动效时直接给终值。 */
export function useCountUp(target: Ref<number>, duration = 620) {
  const shown = ref(0)
  let frame = 0

  function animate(to: number, from: number) {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shown.value = to
      return
    }
    if (frame) cancelAnimationFrame(frame)
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      shown.value = Math.round(from + (to - from) * eased)
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
  }

  onMounted(() => animate(target.value, 0))

  return { shown, animate }
}
