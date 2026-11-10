<template>
  <header class="sticky top-0 z-40 border-b border-white/[0.06] bg-dark-bg/80 backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 md:px-8">
      <!-- 品牌 -->
      <router-link to="/" class="group flex items-center gap-2.5">
        <!-- Logo mark：同心方块 + 定位点 -->
        <span class="relative flex h-6 w-6 items-center justify-center">
          <span
            class="absolute inset-0 rounded-[5px] border border-cyber-blue/40 transition-colors duration-300 group-hover:border-cyber-blue/70"
          ></span>
          <span class="signal-dot absolute h-2 w-2 rounded-[1px] bg-cyber-blue transition-transform duration-300 group-hover:scale-125"></span>
        </span>
        <span class="text-[17px] font-semibold tracking-tight text-text-primary">
          Brief<span class="text-cyber-blue">cast</span>
        </span>
      </router-link>

      <span class="hidden text-[13px] tracking-[0.18em] text-text-tertiary sm:inline">
        {{ tr('会前研究工作台', 'PRE-MEETING INTELLIGENCE') }}
      </span>

      <div class="ml-auto flex items-center gap-3">
        <div class="flex rounded-full border border-white/10 bg-white/[0.03] p-0.5 no-print" role="group" :aria-label="tr('界面语言', 'Interface language')">
          <button
            v-for="option in languageOptions"
            :key="option.value"
            type="button"
            class="rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors"
            :class="locale === option.value ? 'bg-cyber-blue/15 text-cyber-blue' : 'text-text-tertiary hover:text-text-primary'"
            :aria-pressed="locale === option.value"
            @click="setLocale(option.value)"
          >{{ option.label }}</button>
        </div>
        <!-- 命令面板入口 -->
        <button
          type="button"
          class="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[12px] text-text-tertiary transition-colors hover:border-cyber-blue/30 hover:text-text-primary sm:flex no-print"
          :aria-label="tr('打开命令面板', 'Open command palette')"
          @click="openPalette"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l-4 3 4 3m8-6l4 3-4 3" />
          </svg>
          <kbd class="font-mono text-[11px]">{{ shortcutLabel }}</kbd>
        </button>

        <!-- 服务状态 -->
        <span
          class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] transition-colors duration-300"
          :class="statusBoxClass"
          :title="statusHint"
          :aria-label="statusLabel"
        >
          <span class="h-1.5 w-1.5 rounded-full" :class="statusDotClass"></span>
          <span class="hidden sm:inline">{{ statusLabel }}</span>
        </span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHealth } from '../composables/useHealth'
import { locale, setLocale, tr } from '../composables/useLocale'
import { useCommandPalette, isMacPlatform } from '../composables/useCommandPalette'
import type { Language } from '../types'

const languageOptions: { value: Language; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'EN' }
]

const { state } = useHealth()
const { openPalette } = useCommandPalette()
const shortcutLabel = isMacPlatform() ? '⌘K' : 'Ctrl K'

const statusLabel = computed(() => {
  switch (state.value) {
    case 'ready':
      return tr('研究引擎就绪', 'Research engine ready')
    case 'unconfigured':
      return tr('未配置密钥', 'Keys missing')
    case 'offline':
      return tr('后端未连接', 'Backend offline')
    default:
      return tr('检测中', 'Checking')
  }
})

const statusHint = computed(() => {
  switch (state.value) {
    case 'ready':
      return tr('DeepSeek 与 Tavily 均已配置', 'DeepSeek and Tavily are configured')
    case 'unconfigured':
      return tr('后端缺少 DeepSeek 或 Tavily 密钥，真实生成不可用', 'DeepSeek or Tavily key is missing; live generation is unavailable')
    case 'offline':
      return tr('无法访问 /api/health', 'Cannot reach /api/health')
    default:
      return tr('正在检测后端状态', 'Checking backend status')
  }
})

const statusBoxClass = computed(() => {
  switch (state.value) {
    case 'ready':
      return 'border-cyber-success/30 bg-cyber-success/10 text-cyber-success'
    case 'unconfigured':
      return 'border-cyber-warning/30 bg-cyber-warning/10 text-cyber-warning'
    case 'offline':
      return 'border-white/10 bg-white/[0.03] text-text-tertiary'
    default:
      return 'border-white/10 bg-white/[0.03] text-text-tertiary'
  }
})

const statusDotClass = computed(() => {
  switch (state.value) {
    case 'ready':
      return 'bg-cyber-success'
    case 'unconfigured':
      return 'bg-cyber-warning'
    case 'offline':
      return 'bg-text-tertiary'
    default:
      return 'bg-text-tertiary animate-pulse-glow'
  }
})
</script>
