import { ref, computed } from 'vue'
import type { BriefingResult } from '../types'
import sampleData from '../demo/sample-data'
import partialData from '../demo/partial-data'
import insufficientData from '../demo/insufficient-data'
import { sampleDataEn, partialDataEn, insufficientDataEn } from '../demo/english-data'
import { locale } from './useLocale'

export type DemoMode = 'off' | 'completed' | 'partial' | 'insufficient' | 'error'

/** 模块级单例：输入页设置演示模式，结果页读取同一状态。 */
const demoMode = ref<DemoMode>('off')

const DEMO_DATA: Record<Exclude<DemoMode, 'off' | 'error'>, BriefingResult> = {
  completed: sampleData,
  partial: partialData,
  insufficient: insufficientData
}
const DEMO_DATA_EN: typeof DEMO_DATA = {
  completed: sampleDataEn,
  partial: partialDataEn,
  insufficient: insufficientDataEn
}

export function useDemoMode() {
  const isDemoMode = computed(() => demoMode.value !== 'off')

  const demoData = computed<BriefingResult | null>(() => {
    if (demoMode.value === 'off' || demoMode.value === 'error') return null
    return (locale.value === 'zh' ? DEMO_DATA : DEMO_DATA_EN)[demoMode.value]
  })

  function setDemoMode(mode: DemoMode) {
    demoMode.value = mode
  }

  function exitDemoMode() {
    demoMode.value = 'off'
  }

  return {
    isDemoMode,
    demoData,
    demoMode,
    setDemoMode,
    exitDemoMode
  }
}
