<template>
  <div class="min-h-screen bg-[#15181f] px-4 py-6">
    <!-- 预览控制条 -->
    <div class="mx-auto mb-4 flex max-w-[210mm] items-center gap-3 no-print">
      <p class="text-[13px] uppercase tracking-[0.14em] text-text-tertiary">{{ tr('打印预览 · A4', 'Print preview · A4') }}</p>
      <p class="hidden text-[13px] text-text-tertiary sm:block">
        {{ tr('这一版是专门为纸张重排的版面，屏幕上看到的与打印结果一致。', 'This layout is arranged for paper. What you see here matches the printed version.') }}
      </p>

      <div class="ml-auto flex items-center gap-2">
        <button
          class="rounded-md bg-cyber-blue px-3 py-1.5 text-[14px] font-medium text-[#06121c] transition-colors hover:bg-[#22b3f2]"
          @click="printNow"
        >
          {{ tr('打印', 'Print') }}
        </button>
        <button
          class="rounded-md border border-white/10 px-3 py-1.5 text-[14px] text-text-secondary transition-colors hover:border-white/25 hover:text-text-primary"
          @click="$emit('close')"
        >
          {{ tr('返回简报', 'Back to brief') }}
        </button>
      </div>
    </div>

    <!-- 纸张 -->
    <div class="mx-auto max-w-[210mm] bg-white px-[11mm] py-[12mm] shadow-2xl" style="min-height: 297mm">
      <PrintBriefing :result="result" :is-demo="isDemo" />
    </div>

    <p class="mx-auto mt-3 max-w-[210mm] text-center text-[13px] text-text-tertiary no-print">
      {{ tr('打印时请关闭「页眉和页脚」，并保持缩放 100%。', 'For best results, turn off browser headers and footers and print at 100% scale.') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { BriefingResult } from '../types'
import PrintBriefing from './PrintBriefing.vue'
import { tr } from '../composables/useLocale'

defineProps<{
  result: BriefingResult
  isDemo: boolean
}>()

defineEmits<{
  close: []
}>()

function printNow() {
  window.print()
}
</script>
