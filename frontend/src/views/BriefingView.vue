<template>
  <div>
    <!-- 打印预览：与屏幕版共用同一份数据，按纸张重排 -->
    <PaperPreview
      v-if="showPaper && displayResult"
      :result="displayResult"
      :is-demo="isDemoMode"
      @close="closePaper"
    />

    <template v-else>
      <!-- 生成中 -->
      <ProgressDisplay
        v-if="isGenerating"
        :current-stage="currentStage"
        :current-stage-index="currentStageIndex"
        :progress-percentage="progressPercentage"
        :progress-detail="progressDetail"
        :progress-queries="progressQueries"
        :search-rounds="searchRounds"
        :source-count="sourceCount"
        :stages="stages"
        :stage-labels="stageLabels"
        :log="progressLog"
      />

      <!-- 错误（含演示的流中断） -->
      <ErrorDisplay
        v-else-if="error || demoErrorMessage"
        :message="error ?? demoErrorMessage ?? ''"
        @retry="handleRetry"
      />

      <!-- 结果 / 演示 -->
      <BriefingResult
        v-else-if="displayResult"
        :result="displayResult"
        :is-demo="isDemoMode"
        @exit-demo="handleExitDemo"
        @preview="openPaper"
      />

      <!-- 空 -->
      <EmptyState v-else @go-back="goBack" />

      <!-- 演示状态切换：桌面右下角悬浮，移动端隐藏（可用 ?demo= 深链接切换） -->
      <div
        v-if="isDemoMode"
        class="fixed bottom-5 right-5 z-30 hidden max-w-[calc(100vw-2rem)] sm:block no-print"
      >
        <div
          class="flex items-center gap-0.5 overflow-x-auto whitespace-nowrap rounded-full border border-white/10 bg-dark-card/90 px-2 py-1.5 shadow-[0_12px_36px_rgba(2,8,17,0.45)] backdrop-blur"
        >
          <span class="shrink-0 px-1.5 text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
            {{ tr('演示', 'Demo') }}
          </span>
          <button
            v-for="mode in demoSwitches"
            :key="mode.value"
            class="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] transition-colors duration-200"
            :class="
              demoMode === mode.value
                ? 'bg-cyber-blue/15 text-cyber-blue'
                : 'text-text-tertiary hover:text-text-secondary'
            "
            @click="switchDemo(mode.value)"
          >
            {{ mode.label }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBriefing } from '../composables/useBriefing'
import { useDemoMode, type DemoMode } from '../composables/useDemoMode'
import ProgressDisplay from '../components/ProgressDisplay.vue'
import ErrorDisplay from '../components/ErrorDisplay.vue'
import BriefingResult from '../components/BriefingResult.vue'
import EmptyState from '../components/EmptyState.vue'
import PaperPreview from '../components/PaperPreview.vue'
import { tr } from '../composables/useLocale'

const route = useRoute()
const router = useRouter()

const {
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
  stages,
  stageLabels,
  reset
} = useBriefing()

const { isDemoMode, demoData, demoMode, setDemoMode, exitDemoMode } = useDemoMode()

/** 支持 /briefing?demo=partial 这种深链接，方便演示与截图 */
const DEMO_KEYS: DemoMode[] = ['completed', 'partial', 'insufficient', 'error']

function syncFromQuery(value: unknown) {
  const key = typeof value === 'string' ? value : ''
  if (DEMO_KEYS.includes(key as DemoMode)) setDemoMode(key as DemoMode)
}

watch(() => route.query.demo, syncFromQuery, { immediate: true })

const displayResult = computed(() => {
  if (isDemoMode.value) return demoData.value
  return result.value
})

/** 演示「流中断」：SSE 收到 error 事件后的界面 */
const demoErrorMessage = computed(() => {
  if (!isDemoMode.value || demoMode.value !== 'error') return null
  return tr('研究流程在核验阶段中断：服务调用失败。可返回后重试。', 'The research stopped during verification because a provider call failed. You can go back and retry.')
})

const demoSwitches = computed<{ value: DemoMode; label: string }[]>(() => [
  { value: 'completed', label: tr('完整', 'Complete') },
  { value: 'partial', label: tr('部分', 'Partial') },
  { value: 'insufficient', label: tr('不足', 'Insufficient') },
  { value: 'error', label: tr('中断', 'Error') }
])

/* ---------- 打印预览 ---------- */
const showPaper = ref(route.query.paper === '1')

function openPaper() {
  showPaper.value = true
  router.replace({ path: '/briefing', query: { ...route.query, paper: '1' } })
}

function closePaper() {
  showPaper.value = false
  const { paper, ...rest } = route.query
  void paper
  router.replace({ path: '/briefing', query: rest })
}

watch(
  () => route.query.paper,
  (value) => {
    showPaper.value = value === '1'
  }
)

function switchDemo(mode: DemoMode) {
  setDemoMode(mode)
  router.replace({ path: '/briefing', query: { demo: mode } })
}

function goBack() {
  router.push('/')
}

function handleRetry() {
  exitDemoMode()
  reset()
  router.push('/')
}

function handleExitDemo() {
  exitDemoMode()
  reset()
  router.push('/')
}
</script>
