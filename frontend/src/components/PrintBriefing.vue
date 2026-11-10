<template>
  <!--
    打印专用排版：与屏幕版共用同一份数据，但按纸张重新排布。
    目标是在一页 A4 内读完：左侧事实与推断，右栏问题与来源（含完整 URL）。
    字号按纸张阅读距离设定，屏幕版不引用本组件。
  -->
  <article class="print-sheet mx-auto max-w-[190mm] bg-white text-[#111827]">
    <!-- 抬头 -->
    <header class="mb-3 border-b border-[#d1d5db] pb-2">
      <div class="flex items-baseline justify-between gap-3">
        <h1 class="text-[17pt] font-semibold leading-tight text-[#0f172a]">{{ result.headline }}</h1>
        <span class="shrink-0 text-[8.6pt] tracking-[0.18em] text-[#6b7280]">BRIEFCAST</span>
      </div>

      <p class="mt-1.5 text-[9pt] leading-snug text-[#374151]">
        {{ tr('会议：', 'Meeting: ') }}{{ formatDateTime(result.meeting_at) }}
        <span class="text-[#9ca3af]"> · </span>
        {{ tr('研究窗口：', 'Window: ') }}{{ formatDateCompact(result.window_start) }} → {{ formatDateCompact(result.window_end) }}
        <span class="text-[#9ca3af]"> · </span>
        <span v-if="result.generated_at">{{ tr('生成：', 'Generated: ') }}{{ formatDateTime(result.generated_at) }}</span>
        <span class="text-[#9ca3af]"> · </span>
        {{ tr('状态：', 'Status: ') }}{{ statusLabel }}
      </p>
      <p class="text-[9pt] leading-snug text-[#374151]">{{ tr('会议目的：', 'Meeting goal: ') }}{{ result.meeting_goal }}</p>

      <p v-if="!isDemo && result.language !== locale" class="mt-1 text-[8pt] text-[#6b7280]">
        {{ tr('简报正文保留生成时的语言。', 'Research content remains in its original generated language.') }}
      </p>

      <p v-if="isDemo" class="mt-1.5 border border-[#f59e0b] px-2 py-1 text-[8.6pt] font-medium text-[#b45309]">
        {{ tr('演示数据：本页公司、来源与结论均为虚构样例，不是真实研究结果。', 'Demo data: this company, its sources, and conclusions are fictional, not live research.') }}
      </p>
    </header>

    <!-- 图例：事实与推断的区分必须在纸上也成立 -->
    <p class="mb-2.5 text-[8.2pt] text-[#4b5563]">
      <span class="font-semibold text-[#0f172a]">■ {{ tr('已核实事实', 'Verified fact') }}</span>
      <span class="mx-1.5 text-[#d1d5db]">|</span>
      <span class="font-semibold text-[#6d28d9]">■ {{ tr('会议推断', 'Meeting implication') }}</span>
      <span class="mx-1.5 text-[#d1d5db]">|</span>
      {{ tr('[S1] 为来源编号，引文已与网页正文精确匹配；完整网址见右栏。', '[S1] is a source ID. Quotes match retrieved article text; full URLs appear at right.') }}
    </p>

    <div class="grid grid-cols-[1.5fr_1fr] gap-5">
      <!-- 左栏：动态 -->
      <section>
        <h2 class="mb-2 border-b border-[#e5e7eb] pb-1 text-[8.8pt] font-semibold uppercase tracking-wider text-[#374151]">
          {{ tr('最近动态', 'Recent developments') }} ({{ result.developments.length }} {{ tr('条已核实', 'verified') }})
        </h2>

        <p v-if="result.developments.length === 0" class="text-[9pt] leading-relaxed text-[#374151]">
          {{ tr('在会议前 30 天窗口内没有找到可核实的动态，因此不输出未经核验的内容。', 'No verifiable development was found within the 30-day window, so no unsupported claim is shown.') }}
        </p>

        <ul class="space-y-2.5">
          <li v-for="dev in result.developments" :key="dev.id" class="break-inside-avoid">
            <p class="text-[8.4pt] font-medium text-[#374151]">
              <span class="tabular-nums">{{ dev.date }}</span>
              <span class="ml-1 border border-[#d1d5db] px-1 text-[7.6pt] text-[#4b5563]">
                {{ dateBasisMeta(dev.date_basis).label }}
              </span>
            </p>
            <p class="mt-1 text-[9.6pt] leading-[1.5] text-[#111827]">{{ dev.fact }}</p>
            <p v-for="c in dev.citations" :key="c.source_id" class="mt-1 text-[8.8pt] leading-snug text-[#4b5563]">
              [{{ c.source_id }}] “{{ c.quote }}”
            </p>
            <p class="mt-1.5 border-l-2 border-[#a78bfa] pl-2 text-[9.2pt] leading-[1.45] text-[#4c1d95]">
              <span class="font-semibold">{{ tr('会议推断：', 'Meeting implication: ') }}</span>{{ dev.meeting_implication }}
            </p>
          </li>
        </ul>

        <p
          v-if="result.gaps.length > 0"
          class="mt-3 border-t border-[#e5e7eb] pt-1.5 text-[8.2pt] leading-snug text-[#92400e]"
        >
          <span class="font-semibold">{{ tr('研究局限：', 'Research limits: ') }}</span>{{ result.gaps.join(tr('；', '; ')) }}
        </p>
      </section>

      <!-- 右栏：问题 + 来源 -->
      <section>
        <h2 class="mb-2 border-b border-[#e5e7eb] pb-1 text-[8.8pt] font-semibold uppercase tracking-wider text-[#374151]">
          {{ tr('会上可以问', 'Questions to ask') }}
        </h2>
        <ol class="space-y-2">
          <li v-for="(q, i) in result.questions" :key="i" class="break-inside-avoid text-[9.4pt] leading-[1.45]">
            <span class="tabular-nums text-[#6b7280]">{{ i + 1 }}.</span>
            <span class="text-[#111827]">{{ q.question }}</span>
            <span class="mt-0.5 block text-[8.4pt] text-[#6b7280]">{{ tr('依据：', 'Why: ') }}{{ q.reason }}</span>
          </li>
        </ol>

        <h2
          class="mb-2 mt-4 border-b border-[#e5e7eb] pb-1 text-[8.8pt] font-semibold uppercase tracking-wider text-[#374151]"
        >
          {{ tr('信息来源', 'Sources') }}
        </h2>
        <ul class="space-y-2">
          <li v-for="source in result.sources" :key="source.id" class="break-inside-avoid text-[8.4pt] leading-snug">
            <span class="font-semibold text-[#111827]">[{{ source.id }}] {{ source.title }}</span>
            <span class="mt-0.5 block text-[7.8pt] text-[#6b7280]">
              {{ formatDateOnly(source.published_at) }}
              <span class="text-[#d1d5db]">·</span>
              {{ sourceTypeMeta(source.source_type).label }}
            </span>
            <span class="block break-all text-[#374151]">{{ source.url }}</span>
          </li>
        </ul>
      </section>
    </div>

    <footer class="mt-4 border-t border-[#d1d5db] pt-1.5 text-[7.6pt] leading-snug text-[#6b7280]">
      {{ tr('会议推断是基于已核实事实的解读，不是已核实事实本身。「官方域名」仅表示网址匹配所提供的官网，不代表内容经第三方独立证实。本页由 Briefcast 生成，检索与排除数量属于处理统计，不构成可信度评分。', 'Meeting implications interpret verified facts; they are not verified facts themselves. “Official domain” only means the URL matches a supplied domain. Processing counts are not a confidence score. Generated by Briefcast.') }}
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BriefingResult } from '../types'
import { dateBasisMeta, sourceTypeMeta } from '../lib/sourceType'
import { formatDateCompact, formatDateOnly, formatDateTime } from '../lib/format'
import { locale, tr } from '../composables/useLocale'

const props = defineProps<{
  result: BriefingResult
  isDemo: boolean
}>()

const statusLabel = computed(() => {
  switch (props.result.status) {
    case 'completed':
      return tr('研究完成', 'Complete')
    case 'partial':
      return tr('部分证据', 'Partial evidence')
    case 'insufficient_evidence':
      return tr('证据不足', 'Insufficient evidence')
    default:
      return props.result.status
  }
})

</script>
