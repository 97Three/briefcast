import type { Directive } from 'vue'

/**
 * 滚动入场指令：元素进入视口时加 .is-in，CSS 负责过渡。
 * 用 `v-reveal="index"` 传入序号即可得到交错节奏；只改 opacity / transform。
 *
 * 三层兜底，确保内容永远不会因为动画而不可见：
 * 1) 减弱动效 / 无 IntersectionObserver → 立即显示；
 * 2) 首屏元素不等观察器回调，直接入场；
 * 3) 兜底定时器：2 秒后若仍在视口内却未入场，强制显示。
 */
let observer: IntersectionObserver | null = null

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function ensureObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return null
  if (observer) return observer

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        observer?.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  )
  return observer
}

function revealNow(el: HTMLElement) {
  // 下一帧再加 class，保证 transition 从初始态开始
  requestAnimationFrame(() => el.classList.add('is-in'))
}

export const reveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    if (reducedMotion()) {
      el.classList.add('is-in')
      return
    }

    el.classList.add('reveal')
    const order = typeof binding.value === 'number' ? binding.value : 0
    el.style.setProperty('--reveal-i', String(order))

    const target = ensureObserver()
    if (!target) {
      el.classList.add('is-in')
      return
    }

    const rect = el.getBoundingClientRect()
    const inFirstScreen = rect.top < window.innerHeight * 0.98 && rect.bottom > 0

    if (inFirstScreen) {
      revealNow(el)
    } else {
      target.observe(el)
    }

    // 兜底：布局变动（字体加载、图片撑高）可能让元素错过回调
    window.setTimeout(() => {
      if (el.classList.contains('is-in')) return
      const current = el.getBoundingClientRect()
      if (current.top < window.innerHeight && current.bottom > 0) {
        el.classList.add('is-in')
        observer?.unobserve(el)
      }
    }, 2000)
  },
  unmounted(el) {
    observer?.unobserve(el)
  }
}
