<template>
  <!-- 遮罩 -->
  <transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-200"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] no-print"
      @click="$emit('close')"
    ></div>
  </transition>

  <!-- 侧栏：只用 transform / opacity 动画 -->
  <transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="translate-x-full"
    leave-active-class="transition-transform duration-200 ease-in"
    leave-to-class="translate-x-full"
  >
    <aside
      v-if="open"
      class="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-white/10 bg-dark-card shadow-2xl no-print"
      role="dialog"
      aria-modal="true"
      :aria-label="tr('来源详情', 'Source details')"
    >
      <!-- 头部 -->
      <div class="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">
        <span class="font-mono text-[13px] text-cyber-blue">{{ source?.id ?? '—' }}</span>
        <span class="text-[13px] uppercase tracking-wider text-text-tertiary">{{ tr('来源详情', 'Source details') }}</span>
        <button
          class="ml-auto rounded p-1 text-text-tertiary transition-colors hover:text-text-primary"
          :aria-label="tr('关闭', 'Close')"
          @click="$emit('close')"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-5 py-5">
        <template v-if="source">
          <!-- 原文摘录 -->
          <div v-if="quote" class="mb-6">
            <p class="mb-2 text-[13px] uppercase tracking-wider text-text-tertiary">{{ tr('原文摘录', 'Original quote') }}</p>
            <blockquote
              class="rounded-lg border-l-2 border-cyber-blue bg-cyber-blue/[0.05] px-4 py-3 text-[16px] leading-relaxed text-text-primary"
            >
              {{ quote }}
            </blockquote>
            <p class="mt-2 text-[13px] leading-relaxed text-text-tertiary">
              {{ tr('该句已与抓取到的网页正文做过精确匹配。', 'This passage was matched against retrieved article text.') }}
            </p>
          </div>

          <!-- 来源信息 -->
          <dl class="space-y-4">
            <div>
              <dt class="mb-1 text-[13px] uppercase tracking-wider text-text-tertiary">{{ tr('来源标题', 'Source title') }}</dt>
              <dd class="text-[16px] leading-relaxed text-text-primary">{{ source.title }}</dd>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <dt class="mb-1 text-[13px] uppercase tracking-wider text-text-tertiary">{{ tr('发布日期', 'Published') }}</dt>
                <dd class="font-mono text-[15px] text-text-secondary">{{ formatDateOnly(source.published_at) }}</dd>
              </div>
              <div>
                <dt class="mb-1 text-[13px] uppercase tracking-wider text-text-tertiary">{{ tr('类型', 'Type') }}</dt>
                <dd>
                  <span
                    class="inline-flex items-center rounded border px-1.5 py-0.5 text-[13px]"
                    :class="typeClass"
                    :title="typeHint"
                  >
                    {{ typeLabel }}
                  </span>
                </dd>
              </div>
            </div>

            <div>
              <dt class="mb-1 text-[13px] uppercase tracking-wider text-text-tertiary">{{ tr('检索时间', 'Retrieved') }}</dt>
              <dd class="font-mono text-[14px] text-text-tertiary">{{ formatDateTime(source.retrieved_at) }}</dd>
            </div>

            <div>
              <dt class="mb-1 text-[13px] uppercase tracking-wider text-text-tertiary">{{ tr('检索式', 'Search query') }}</dt>
              <dd class="font-mono text-[14px] leading-relaxed text-text-tertiary">{{ source.query }}</dd>
            </div>

            <!-- 搜索摘要 -->
            <div>
              <dt class="mb-1 flex items-center gap-1.5 text-[13px] uppercase tracking-wider text-text-tertiary">
                {{ tr('搜索摘要', 'Search summary') }}
                <span class="rounded bg-white/[0.06] px-1 py-0.5 text-[12px] normal-case tracking-normal text-text-tertiary">
                  {{ tr('非原文引述', 'Not a quote') }}
                </span>
              </dt>
              <dd class="text-[15px] leading-relaxed text-text-secondary">{{ source.snippet }}</dd>
            </div>
          </dl>

          <!-- 原网页链接 -->
          <a
            :href="source.url"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-6 flex items-center justify-center gap-2 rounded-lg bg-cyber-blue px-4 py-2.5 text-[15px] font-medium text-[#06121c] transition-all duration-200 hover:bg-[#22b3f2] hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]"
          >
            {{ tr('打开原网页', 'Open original page') }}
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <p class="mt-2 break-all font-mono text-[13px] text-text-tertiary">{{ source.url }}</p>
        </template>

        <p v-else class="text-[15px] text-text-tertiary">{{ tr('该来源不在本次结果中。', 'This source is unavailable in the current brief.') }}</p>
      </div>
    </aside>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Source } from '../types'
import { sourceTypeMeta } from '../lib/sourceType'
import { formatDateOnly, formatDateTime } from '../lib/format'
import { tr } from '../composables/useLocale'

const props = defineProps<{
  open: boolean
  source?: Source | null
  quote?: string | null
}>()

defineEmits<{
  close: []
}>()

const meta = computed(() => sourceTypeMeta(props.source?.source_type ?? 'unclassified'))
const typeLabel = computed(() => meta.value.label)
const typeHint = computed(() => meta.value.hint)
const typeClass = computed(() => meta.value.className)

</script>
