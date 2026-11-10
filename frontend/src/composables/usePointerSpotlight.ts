import { onMounted, onUnmounted } from 'vue'

/**
 * 指针光斑：把鼠标位置写入 CSS 变量，由一层 fixed 的 radial-gradient 消费。
 * 只在「精确指针 + 非减弱动效」下启用；写入用 rAF 合并，避免每个 pointermove 都触发样式计算。
 */
export function usePointerSpotlight() {
  let frame = 0
  let enabled = false

  function onPointerMove(event: PointerEvent) {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      const root = document.documentElement
      root.style.setProperty('--spot-x', `${event.clientX}px`)
      root.style.setProperty('--spot-y', `${event.clientY}px`)
      root.style.setProperty('--spot-on', '1')
    })
  }

  function onPointerLeave() {
    document.documentElement.style.setProperty('--spot-on', '0')
  }

  onMounted(() => {
    if (typeof window === 'undefined') return
    enabled =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!enabled) return

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerleave', onPointerLeave)
  })

  onUnmounted(() => {
    if (!enabled) return
    window.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerleave', onPointerLeave)
    if (frame) cancelAnimationFrame(frame)
  })
}
