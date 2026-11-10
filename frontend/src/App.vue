<template>
  <div class="relative flex min-h-screen flex-col bg-dark-bg grid-bg">
    <!-- 背景层：环境光球 → 指针光斑 → 胶片颗粒，全部在内容之下 -->
    <div class="ambient-field no-print" aria-hidden="true">
      <span class="ambient-orb ambient-orb--left"></span>
      <span class="ambient-orb ambient-orb--right"></span>
      <span class="ambient-orb ambient-orb--lower"></span>
      <span class="ambient-scan"></span>
      <span class="spotlight-layer"></span>
      <span class="grain-layer"></span>
    </div>

    <AppHeader />

    <main class="relative z-10 flex-1">
      <router-view />
    </main>

    <footer class="relative z-10 border-t border-white/[0.05] px-5 py-4 no-print">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-text-tertiary">
        <span>Briefcast</span>
        <span class="text-white/10">/</span>
        <span>{{ tr('证据优先的会前研究', 'Evidence-first meeting research') }}</span>
        <span class="ml-auto">{{ tr('所有事实均可回溯至来源引文', 'Every fact links back to a source') }}</span>
      </div>
    </footer>

    <CommandPalette :open="paletteOpen" :actions="paletteActions" @close="closePalette" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import CommandPalette from './components/CommandPalette.vue'
import { locale, setLocale, tr } from './composables/useLocale'
import { usePointerSpotlight } from './composables/usePointerSpotlight'
import { useCommandPalette, isMacPlatform } from './composables/useCommandPalette'
import type { PaletteAction } from './composables/useCommandPalette'
import { useBriefing } from './composables/useBriefing'
import { useDemoMode } from './composables/useDemoMode'
import { buildBriefText } from './lib/briefText'
import { navigateWithTransition } from './composables/useViewTransition'

const router = useRouter()
const route = useRoute()
const { paletteOpen, closePalette, togglePalette } = useCommandPalette()
const { result } = useBriefing()
const { isDemoMode, demoData, setDemoMode } = useDemoMode()

usePointerSpotlight()

const currentResult = computed(() => (isDemoMode.value ? demoData.value : result.value))

function go(path: string, query?: Record<string, string>) {
  navigateWithTransition(() => router.push({ path, query }))
}

function openDemo(mode: 'completed' | 'partial' | 'insufficient' | 'error') {
  setDemoMode(mode)
  go('/briefing', { demo: mode })
}

async function copyBrief() {
  const data = currentResult.value
  if (!data) return
  try {
    await navigator.clipboard.writeText(buildBriefText(data, isDemoMode.value))
  } catch {
    window.alert(tr('复制失败，请手动选择文本复制。', 'Copy failed. Please select the text manually.'))
  }
}

const paletteActions = computed<PaletteAction[]>(() => {
  const navGroup = tr('导航', 'Navigate')
  const outputGroup = tr('输出', 'Output')
  const demoGroup = tr('演示数据', 'Demo data')
  const uiGroup = tr('界面', 'Interface')
  const printHint = isMacPlatform() ? '⌘P' : 'Ctrl P'

  const actions: PaletteAction[] = [
    {
      id: 'home',
      label: tr('返回输入页', 'Back to input'),
      group: navGroup,
      icon: 'M3 10.5L12 3l9 7.5M5.5 9.5V20h13V9.5',
      run: () => go('/')
    }
  ]

  if (currentResult.value) {
    actions.push({
      id: 'copy',
      label: tr('复制简报文本', 'Copy brief as text'),
      group: navGroup,
      icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
      run: copyBrief
    })
  }

  actions.push(
    {
      id: 'print-preview',
      label: tr('打印预览（A4）', 'Print preview (A4)'),
      group: outputGroup,
      icon: 'M2.5 12C3.7 7.9 7.5 5 12 5s8.3 2.9 9.5 7c-1.2 4.1-5 7-9.5 7s-8.3-2.9-9.5-7zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
      run: () => go('/briefing', { ...(route.query as Record<string, string>), paper: '1' })
    },
    {
      id: 'print',
      label: tr('打印当前页', 'Print this page'),
      group: outputGroup,
      hint: printHint,
      icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 012 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
      run: () => window.print()
    },
    {
      id: 'demo-completed',
      label: tr('演示：完整结果', 'Demo: complete'),
      group: demoGroup,
      hint: '1',
      icon: 'M4 6h16M4 12h16M4 18h10',
      run: () => openDemo('completed')
    },
    {
      id: 'demo-partial',
      label: tr('演示：部分证据', 'Demo: partial evidence'),
      group: demoGroup,
      hint: '2',
      icon: 'M4 6h16M4 12h16M4 18h10',
      run: () => openDemo('partial')
    },
    {
      id: 'demo-insufficient',
      label: tr('演示：证据不足', 'Demo: insufficient evidence'),
      group: demoGroup,
      hint: '3',
      icon: 'M4 6h16M4 12h16M4 18h10',
      run: () => openDemo('insufficient')
    },
    {
      id: 'demo-error',
      label: tr('演示：流中断', 'Demo: stream error'),
      group: demoGroup,
      hint: '4',
      icon: 'M4 6h16M4 12h16M4 18h10',
      run: () => openDemo('error')
    },
    {
      id: 'locale',
      label: locale.value === 'zh' ? 'Switch to English' : '切换到中文',
      group: uiGroup,
      hint: locale.value === 'zh' ? 'ZH' : 'EN',
      icon: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8M12 3c2.4 2.6 3.6 5.6 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.6-3.6-9S9.6 5.6 12 3z',
      run: () => setLocale(locale.value === 'zh' ? 'en' : 'zh')
    }
  )

  return actions
})

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    togglePalette()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
