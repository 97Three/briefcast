import { ref } from 'vue'
import type { Language } from '../types'

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('briefcast-locale') : null
const initial: Language = stored === 'zh' || stored === 'en'
  ? stored
  : 'en'

export const locale = ref<Language>(initial)

export function setLocale(next: Language) {
  locale.value = next
  if (typeof localStorage !== 'undefined') localStorage.setItem('briefcast-locale', next)
  if (typeof document !== 'undefined') {
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'
    document.title = next === 'zh'
      ? 'Briefcast · 会前 30 天研究简报'
      : 'Briefcast · 30-day meeting brief'
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      next === 'zh'
        ? '证据优先的会前研究：核对最近 30 天的公开报道，输出一页有来源的简报。'
        : 'Evidence-first meeting research: check the last 30 days of reporting and prepare a source-backed brief.'
    )
  }
}

export function tr(zh: string, en: string): string {
  return locale.value === 'zh' ? zh : en
}

setLocale(initial)
