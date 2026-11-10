<template>
  <div class="mx-auto flex min-h-[60vh] max-w-lg items-center px-5">
    <div class="w-full animate-enter">
      <div class="rounded-xl border border-white/[0.08] bg-dark-card/60 p-7 text-center backdrop-blur-sm">
        <span class="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
          <svg class="h-5 w-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </span>

        <h2 class="text-lg font-medium text-text-primary">{{ tr('还没有简报', 'No brief yet') }}</h2>
        <p class="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-text-secondary">
          {{ tr('填写研究对象与会议时间即可生成，或先看一份标注为演示数据的样例。', 'Enter a subject and meeting time to generate one, or explore a clearly labeled demo.') }}
        </p>

        <button
          class="mt-6 inline-flex items-center gap-2 rounded-md bg-cyber-blue px-4 py-2 text-[15px] font-medium text-[#06121c] transition-all duration-200 hover:bg-[#22b3f2] hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]"
          @click="$emit('goBack')"
        >
          {{ tr('回到输入', 'Back to input') }}
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { tr } from '../composables/useLocale'
defineEmits<{
  goBack: []
}>()
</script>
