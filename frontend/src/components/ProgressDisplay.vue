<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-2xl animate-enter">
      <div class="card-glow rounded-2xl border border-white/[0.09] bg-dark-card/85 p-7 shadow-[0_24px_70px_rgba(2,8,17,0.3)] backdrop-blur-sm md:p-10">
        <!-- 标题区 -->
        <div class="mb-9 text-center">
          <div class="relative mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center">
            <span class="absolute inset-0 rounded-full bg-cyber-blue/15 animate-pulse-glow"></span>
            <span class="absolute inset-2 rounded-full border border-cyber-blue/30"></span>
            <svg
              class="relative h-8 w-8 text-cyber-blue"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.65"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 class="text-xl font-semibold tracking-tight text-text-primary md:text-2xl">
            {{ tr('正在构建简报', 'Building your brief') }}
          </h2>
          <p class="mt-2 min-h-[1.25rem] text-sm text-text-secondary">
            {{ currentStage ? stageHint(currentStage) : tr('初始化研究任务…', 'Starting research…') }}
          </p>
        </div>

        <!-- 进度条：只用 transform 动画 -->
        <div class="mb-9">
          <div class="mb-2 flex items-baseline justify-between text-xs">
            <span class="text-text-tertiary">{{ tr('研究进度', 'Research progress') }}</span>
            <span class="font-mono text-cyber-blue">{{ Math.round(progressPercentage) }}%</span>
          </div>
          <div class="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              class="progress-flow h-full origin-left bg-gradient-to-r from-cyber-blue via-[#9ae7f2] to-cyber-purple shadow-[0_0_14px_rgba(85,195,231,0.55)] transition-transform duration-500 ease-out"
              :style="{ transform: `scaleX(${progressPercentage / 100})` }"
            ></div>
          </div>
        </div>

        <!-- 阶段时间线 -->
        <ol class="space-y-0">
          <li
            v-for="(stage, index) in stages"
            :key="stage"
            class="relative flex items-center gap-4 pb-5 last:pb-0"
          >
            <!-- 连接线（装饰，非动画属性） -->
            <span
              v-if="index < stages.length - 1"
              class="absolute left-[13px] top-7 h-[calc(100%-1rem)] w-px transition-colors duration-300"
              :class="index < currentStageIndex ? 'bg-cyber-blue/40' : 'bg-white/10'"
              aria-hidden="true"
            ></span>

            <!-- 状态点 -->
            <span
              class="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-all duration-300"
              :class="[
                index < currentStageIndex ? 'bg-cyber-blue/20 text-cyber-blue ring-1 ring-cyber-blue/40' : '',
                index === currentStageIndex ? 'bg-cyber-blue text-white shadow-[0_0_16px_rgba(14,165,233,0.45)] radar-ring' : '',
                index > currentStageIndex ? 'bg-white/[0.04] text-text-tertiary' : ''
              ]"
            >
              <svg v-if="index < currentStageIndex" class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <template v-else>{{ String(index + 1).padStart(2, '0') }}</template>
            </span>

            <!-- 阶段名 -->
            <span
              class="text-sm transition-colors duration-300"
              :class="index <= currentStageIndex ? 'text-text-primary' : 'text-text-tertiary'"
            >
              {{ stageLabels[stage] }}
            </span>

            <!-- 当前阶段脉冲 -->
            <span
              v-if="index === currentStageIndex"
              class="ml-auto flex items-center gap-2 text-[13px] text-cyber-blue"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-cyber-blue animate-pulse-glow"></span>
              {{ tr('进行中', 'In progress') }}
            </span>
          </li>
        </ol>

        <!-- 运行统计 -->
        <div
          v-if="searchRounds > 0 || sourceCount > 0"
          class="mt-8 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-6"
        >
          <div class="rounded-lg bg-white/[0.03] px-4 py-3 text-center">
            <p class="font-mono text-xl text-cyber-blue"><CountNumber :value="searchRounds" /></p>
            <p class="mt-0.5 text-[13px] text-text-tertiary">{{ tr('检索轮次', 'Search rounds') }}</p>
          </div>
          <div class="rounded-lg bg-white/[0.03] px-4 py-3 text-center">
            <p class="font-mono text-xl text-cyber-blue"><CountNumber :value="sourceCount" /></p>
            <p class="mt-0.5 text-[13px] text-text-tertiary">{{ tr('候选来源', 'Candidate sources') }}</p>
          </div>
        </div>

        <!-- 实时事件流：直接渲染后端发出的 SSE 事件，不是模拟进度 -->
        <div v-if="log.length > 0" class="mt-6">
          <LiveEventLog :entries="log" />
        </div>

        <!-- 当前检索词 -->
        <div v-if="progressQueries.length > 0" class="mt-6 border-t border-white/[0.07] pt-6">
          <p class="mb-2.5 text-[13px] uppercase tracking-wider text-text-tertiary">{{ tr('当前检索', 'Current searches') }}</p>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="(query, index) in progressQueries"
              :key="index"
              class="rounded border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[13px] text-text-secondary"
            >
              {{ query }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProgressStage } from '../types'
import type { ProgressLogEntry } from '../composables/useBriefing'
import { tr } from '../composables/useLocale'
import CountNumber from './CountNumber.vue'
import LiveEventLog from './LiveEventLog.vue'

function stageHint(stage: ProgressStage): string {
  return {
    plan: tr('正在规划检索…', 'Planning searches…'),
    search: tr('正在检索近期来源…', 'Searching recent sources…'),
    assess: tr('正在评估证据…', 'Assessing evidence…'),
    draft: tr('正在整理近期动态…', 'Drafting recent developments…'),
    verify: tr('正在核验正文引文…', 'Verifying article quotes…'),
    compose: tr('正在组织会议问题…', 'Composing meeting questions…')
  }[stage]
}

defineProps<{
  currentStage: ProgressStage | null
  currentStageIndex: number
  progressPercentage: number
  progressDetail: string
  progressQueries: string[]
  searchRounds: number
  sourceCount: number
  stages: ProgressStage[]
  stageLabels: Record<ProgressStage, string>
  log: ProgressLogEntry[]
}>()
</script>
