import { ref, computed } from 'vue'
import type { BriefingRequest, BriefingResult, ProgressEvent, ProgressStage } from '../types'
import { streamBriefing } from '../api/client'
import { tr } from './useLocale'

/**
 * 模块级单例状态。
 * 输入页触发请求、结果页读取结果，两个视图必须共享同一份状态，
 * 因此 ref 定义在模块作用域，而不是 useBriefing() 内部。
 */
const isGenerating = ref(false)
const result = ref<BriefingResult | null>(null)
const error = ref<string | null>(null)
const currentStage = ref<ProgressStage | null>(null)
const progressDetail = ref('')
const progressQueries = ref<string[]>([])
const searchRounds = ref(0)
const sourceCount = ref(0)
/** 防止并发请求互相覆盖 */
let runToken = 0

/**
 * 真实 SSE 事件的时间线，用于进度页的「实时事件流」。
 * 只记录后端真正发出的事件，不虚构任何阶段。
 */
export interface ProgressLogEntry {
  id: number
  stage: ProgressStage
  detail: string
  queries: string[]
  searchRounds: number
  sourceCount: number
  elapsedMs: number
}

const progressLog = ref<ProgressLogEntry[]>([])
let logSequence = 0
let runStartedAt = 0

export const BRIEFING_STAGES: ProgressStage[] = [
  'plan',
  'search',
  'assess',
  'draft',
  'verify',
  'compose'
]

export const STAGE_LABELS = computed<Record<ProgressStage, string>>(() => ({
  plan: tr('规划检索', 'Plan searches'),
  search: tr('检索来源', 'Find sources'),
  assess: tr('评估证据', 'Assess evidence'),
  draft: tr('起草动态', 'Draft developments'),
  verify: tr('校验引用', 'Verify quotes'),
  compose: tr('生成问题', 'Compose questions')
}))

export function useBriefing() {
  const currentStageIndex = computed(() => {
    if (!currentStage.value) return -1
    return BRIEFING_STAGES.indexOf(currentStage.value)
  })

  const progressPercentage = computed(() => {
    if (currentStageIndex.value < 0) return 0
    return ((currentStageIndex.value + 1) / BRIEFING_STAGES.length) * 100
  })

  function resetProgress() {
    currentStage.value = null
    progressDetail.value = ''
    progressQueries.value = []
    searchRounds.value = 0
    sourceCount.value = 0
    progressLog.value = []
    logSequence = 0
  }

  /**
   * 发起流式生成。
   * 调用方通常不 await：先跳转到结果页，让进度视图实时消费 SSE 事件。
   */
  async function generate(request: BriefingRequest) {
    const token = ++runToken
    isGenerating.value = true
    error.value = null
    result.value = null
    resetProgress()
    runStartedAt = Date.now()

    try {
      for await (const event of streamBriefing(request)) {
        if (token !== runToken) return

        if (event.type === 'progress') {
          const progress = event.data as ProgressEvent
          currentStage.value = progress.stage
          progressDetail.value = progress.detail
          progressQueries.value = progress.queries ?? []
          searchRounds.value = progress.search_rounds ?? 0
          sourceCount.value = progress.source_count ?? 0
          progressLog.value.push({
            id: ++logSequence,
            stage: progress.stage,
            detail: progress.detail,
            queries: progress.queries ?? [],
            searchRounds: progress.search_rounds ?? 0,
            sourceCount: progress.source_count ?? 0,
            elapsedMs: Date.now() - runStartedAt
          })
        } else if (event.type === 'result') {
          result.value = event.data as BriefingResult
        } else if (event.type === 'error') {
          error.value = (event.data as { message?: string }).message || tr('生成失败', 'Generation failed')
        }
      }
    } catch (e) {
      if (token !== runToken) return
      error.value = e instanceof Error ? e.message : tr('连接失败', 'Connection failed')
    } finally {
      if (token === runToken) isGenerating.value = false
    }
  }

  function reset() {
    runToken++
    isGenerating.value = false
    result.value = null
    error.value = null
    resetProgress()
  }

  return {
    isGenerating,
    result,
    error,
    currentStage,
    currentStageIndex,
    progressDetail,
    progressQueries,
    progressPercentage,
    searchRounds,
    sourceCount,
    progressLog,
    stages: BRIEFING_STAGES,
    stageLabels: STAGE_LABELS,
    generate,
    reset
  }
}
