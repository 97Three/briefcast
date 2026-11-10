<template>
  <div class="rounded-lg border border-white/[0.07] bg-[#070c15]/70 p-3">
    <div class="mb-2 flex items-center gap-2">
      <span class="h-1.5 w-1.5 rounded-full bg-cyber-success/80 signal-dot"></span>
      <span class="font-mono text-[11px] uppercase tracking-[0.14em] text-text-tertiary">
        {{ tr('实时事件流', 'Live event stream') }}
      </span>
      <span class="ml-auto font-mono text-[11px] text-text-tertiary">
        {{ tr('已连接', 'connected') }}
      </span>
    </div>

    <ol class="space-y-1 font-mono text-[12px] leading-relaxed" aria-live="polite">
      <li
        v-for="(entry, index) in visible"
        :key="entry.id"
        class="log-line flex items-baseline gap-2"
        :class="index === visible.length - 1 ? 'text-text-primary' : 'text-text-tertiary'"
      >
        <span class="shrink-0 text-cyber-blue/70">+{{ (entry.elapsedMs / 1000).toFixed(1) }}s</span>
        <span class="shrink-0 text-text-secondary">{{ entry.stage }}</span>
        <span class="min-w-0 flex-1 truncate" :title="entry.detail">{{ entry.detail }}</span>
      </li>
      <li v-if="visible.length === 0" class="text-text-tertiary">
        {{ tr('等待第一个事件…', 'Waiting for the first event…') }}
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProgressLogEntry } from '../composables/useBriefing'
import { tr } from '../composables/useLocale'

const props = withDefaults(
  defineProps<{
    entries: ProgressLogEntry[]
    max?: number
  }>(),
  { max: 6 }
)

/** 只保留最近几条：终端式日志看的是"刚刚发生了什么"，不是完整历史 */
const visible = computed(() => props.entries.slice(-props.max))
</script>
