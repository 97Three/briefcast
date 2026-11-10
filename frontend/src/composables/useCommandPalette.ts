import { ref } from 'vue'

/** 命令面板里的一项动作 */
export interface PaletteAction {
  id: string
  label: string
  hint?: string
  /** 分组标题：搜索为空时按组显示，便于快速定位 */
  group?: string
  /** 内联 SVG path，避免引入图标依赖 */
  icon?: string
  run: () => void
}

/** 命令面板的开关状态是全局单例：页头按钮与 ⌘K 快捷键共用。 */
const paletteOpen = ref(false)

export function useCommandPalette() {
  function openPalette() {
    paletteOpen.value = true
  }
  function closePalette() {
    paletteOpen.value = false
  }
  function togglePalette() {
    paletteOpen.value = !paletteOpen.value
  }

  return { paletteOpen, openPalette, closePalette, togglePalette }
}

/** 是否 macOS：只用于显示 ⌘ 还是 Ctrl 的提示文案 */
export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false
  return /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)
}
