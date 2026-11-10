<template>
  <div class="mx-auto flex min-h-[60vh] max-w-lg items-center px-5">
    <div class="w-full animate-enter">
      <div class="rounded-xl border border-cyber-error/20 bg-dark-card/60 p-7 text-center backdrop-blur-sm">
        <span class="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-cyber-error/25 bg-cyber-error/[0.08]">
          <svg class="h-5 w-5 text-cyber-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>

        <h2 class="text-lg font-medium text-text-primary">{{ tr('生成中断', 'Generation interrupted') }}</h2>
        <p class="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-text-secondary">
          {{ locale === 'zh' ? message : tr('研究未能完成，请重试。', 'The research could not finish. Please try again.') }}
        </p>

        <p class="mt-3 text-[13px] leading-relaxed text-text-tertiary">
          {{ tr('如果是密钥未配置（503），请在后端 .env 中补充 DeepSeek 与 Tavily 密钥后重试。', 'If the API keys are missing (503), configure DeepSeek and Tavily in the backend .env file.') }}
        </p>

        <button
          class="mt-6 inline-flex items-center gap-2 rounded-md bg-cyber-blue px-4 py-2 text-[15px] font-medium text-[#06121c] transition-all duration-200 hover:bg-[#22b3f2] hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]"
          @click="$emit('retry')"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ tr('返回并重试', 'Back and retry') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { locale, tr } from '../composables/useLocale'
defineProps<{
  message: string
}>()

defineEmits<{
  retry: []
}>()
</script>
