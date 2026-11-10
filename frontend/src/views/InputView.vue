<template>
  <div class="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
    <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
      <!-- 左：定位说明 -->
      <section class="animate-enter">
        <p class="mb-5 flex items-center gap-3 text-[13px] uppercase tracking-[0.2em] text-cyber-blue">
          <span class="signal-dot h-2 w-2 rounded-full bg-cyber-blue"></span>
          <span class="h-px w-6 bg-cyber-blue/50"></span>
          {{ tr('会前研究简报', 'Pre-meeting brief') }}
        </p>

        <h1 class="text-balance text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.035em] text-text-primary md:text-[3.5rem]">
          {{ tr('开会之前，', 'Before the meeting,') }}
          <br class="hidden sm:block" />
          <span class="hero-accent">{{ tr('先看清最近的变化。', 'know what changed.') }}</span>
        </h1>

        <p class="mt-7 max-w-xl text-[17px] leading-[1.85] text-text-secondary">
          {{ tr('给出研究对象与会议时间，Briefcast 会检索最近 30 天的公开报道，逐条核对正文引文，输出一页可直接带进会议的简报。', 'Enter who you are meeting and when. Briefcast researches the preceding 30 days, verifies quotes against source text, and prepares a one-page brief.') }}
        </p>

        <!-- 能力说明 -->
        <ul class="mt-11 max-w-xl space-y-2.5">
          <li
            v-for="item in capabilities"
            :key="item.title"
            class="interactive-card flex items-start gap-4 rounded-xl border border-white/[0.07] bg-dark-card/45 px-5 py-4 shadow-[0_10px_30px_rgba(2,8,17,0.1)]"
          >
            <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyber-blue/20 bg-cyber-blue/[0.07]">
              <component :is="item.icon" class="h-4 w-4 text-cyber-blue" />
            </span>
            <span class="min-w-0">
              <span class="block text-[15px] font-medium text-text-primary">{{ item.title }}</span>
              <span class="mt-0.5 block text-[14px] leading-relaxed text-text-tertiary">{{ item.desc }}</span>
            </span>
          </li>
        </ul>

        <p class="mt-6 flex items-start gap-2 text-[13px] leading-relaxed text-text-tertiary">
          <span class="mt-1 h-1 w-1 shrink-0 rounded-full bg-text-tertiary"></span>
          {{ tr('会议意义是基于事实的推断，与已核实事实在简报中分开展示。', 'Meeting implications are interpretations, shown separately from verified facts.') }}
        </p>
      </section>

      <!-- 右：输入表单 -->
      <section class="animate-enter">
        <!-- 演示状态横幅 -->
        <div
          v-if="isDemoMode"
          class="mb-4 flex items-start gap-2.5 rounded-lg border border-cyber-warning/30 bg-cyber-warning/[0.07] px-3.5 py-3"
        >
          <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyber-warning"></span>
          <p class="flex-1 text-[14px] leading-relaxed text-cyber-warning">
            {{ tr('演示模式：当前展示虚构样例，非真实研究结果。', 'Demo mode: this is fictional sample data, not live research.') }}
          </p>
          <button
            type="button"
            class="shrink-0 text-[14px] text-cyber-warning/70 underline underline-offset-2 transition-colors hover:text-cyber-warning"
            @click="exitDemoMode"
          >
            {{ tr('退出', 'Exit') }}
          </button>
        </div>

        <form
          class="tech-panel rounded-2xl border border-white/[0.11] bg-dark-card/85 p-6 shadow-[0_24px_70px_rgba(2,8,17,0.3)] backdrop-blur-sm transition-shadow duration-300 focus-within:shadow-[0_24px_70px_rgba(2,8,17,0.35),0_0_40px_rgba(85,195,231,0.07)] md:p-8"
          novalidate
          @submit.prevent="handleSubmit"
        >
          <div class="mb-7 border-b border-white/[0.08] pb-6">
            <p class="mb-2 font-mono text-[12px] uppercase tracking-[0.18em] text-cyber-blue">{{ tr('新建研究简报', 'New research brief') }}</p>
            <h2 class="text-2xl font-semibold tracking-tight text-text-primary">{{ tr('创建会前简报', 'Create a meeting brief') }}</h2>
            <p class="mt-1 text-[14px] text-text-secondary">{{ tr('填写会议背景，开始核查最近的公开动态。', 'Add meeting context to investigate recent developments.') }}</p>
          </div>
          <!-- 研究对象 + 类型 -->
          <div class="mb-5">
            <div class="mb-2 flex items-center justify-between">
              <label for="entity" class="text-[13px] uppercase tracking-wider text-text-tertiary">
                {{ tr('研究对象', 'Research subject') }}
              </label>
              <!-- 分段控件 -->
              <div class="flex rounded-md border border-white/10 bg-white/[0.02] p-0.5">
                <button
                  v-for="option in entityTypes"
                  :key="option.value"
                  type="button"
                  class="rounded px-2.5 py-1 text-[13px] transition-all duration-200"
                  :class="
                    form.entity_type === option.value
                      ? 'bg-cyber-blue/15 text-cyber-blue'
                      : 'text-text-tertiary hover:text-text-secondary'
                  "
                  @click="form.entity_type = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
            <input
              id="entity"
              v-model="form.entity"
              type="text"
              autocomplete="off"
              placeholder="Microsoft"
              class="w-full rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-[17px] text-text-primary placeholder-text-tertiary/70 outline-none transition-all duration-200 focus:border-cyber-blue/50 focus:bg-cyber-blue/[0.04]"
            />
          </div>

          <!-- 会议时间 + 目的 -->
          <div class="mb-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label for="meeting_at" class="mb-2 block text-[13px] uppercase tracking-wider text-text-tertiary">
                {{ tr('会议时间', 'Meeting time') }}
              </label>
              <input
                id="meeting_at"
                v-model="form.meeting_datetime"
                type="datetime-local"
                class="w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 font-mono text-[15px] text-text-primary outline-none transition-all duration-200 focus:border-cyber-blue/50 focus:bg-cyber-blue/[0.04] [color-scheme:dark]"
              />
            </div>
            <div>
              <label for="goal" class="mb-2 block text-[13px] uppercase tracking-wider text-text-tertiary">
                {{ tr('会议目的', 'Meeting goal') }}
              </label>
              <input
                id="goal"
                v-model="form.meeting_goal"
                type="text"
                :placeholder="tr('商务合作交流', 'Explore a partnership')"
                class="w-full rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-[15px] text-text-primary placeholder-text-tertiary/70 outline-none transition-all duration-200 focus:border-cyber-blue/50 focus:bg-cyber-blue/[0.04]"
              />
            </div>
          </div>

          <!-- 高级选项 -->
          <div class="mb-5">
            <button
              type="button"
              class="group flex items-center gap-1.5 text-[14px] text-text-secondary transition-colors hover:text-cyber-blue"
              :aria-expanded="showAdvanced"
              @click="showAdvanced = !showAdvanced"
            >
              <svg
                class="h-3.5 w-3.5 transition-transform duration-200"
                :class="{ 'rotate-90': showAdvanced }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              {{ tr('补充信息', 'More context') }}
              <span class="text-text-tertiary">{{ tr('（可选）', '(optional)') }}</span>
            </button>

            <div v-if="showAdvanced" class="mt-4 space-y-4 border-l border-white/[0.08] pl-4 animate-enter">
              <div v-if="form.entity_type === 'person'">
                <label for="org" class="mb-1.5 block text-[13px] text-text-tertiary">{{ tr('所属机构', 'Organization') }}</label>
                <input
                  id="org"
                  v-model="form.organization"
                  type="text"
                  :placeholder="tr('用于区分同名人物', 'Distinguish people with the same name')"
                  class="w-full rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-[14px] text-text-primary placeholder-text-tertiary/70 outline-none transition-colors focus:border-cyber-blue/50"
                />
              </div>
              <div>
                <label for="domain" class="mb-1.5 block text-[13px] text-text-tertiary">{{ tr('官方网站', 'Official website') }}</label>
                <input
                  id="domain"
                  v-model="form.official_domain"
                  type="text"
                  placeholder="microsoft.com"
                  class="w-full rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 font-mono text-[14px] text-text-primary placeholder-text-tertiary/70 outline-none transition-colors focus:border-cyber-blue/50"
                />
                <p class="mt-1.5 text-[13px] leading-relaxed text-text-tertiary">
                  {{ tr('仅用于标记网址匹配该域名的来源，不代表内容经过独立证实。', 'Only labels matching URLs; it does not mean the content was independently verified.') }}
                </p>
              </div>
              <div>
                <label for="attendee" class="mb-1.5 block text-[13px] text-text-tertiary">{{ tr('参会人', 'Attendee') }}</label>
                <input
                  id="attendee"
                  v-model="form.attendee"
                  type="text"
                  :placeholder="tr('对方产品负责人', 'Their product lead')"
                  class="w-full rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-[14px] text-text-primary placeholder-text-tertiary/70 outline-none transition-colors focus:border-cyber-blue/50"
                />
              </div>
              <div>
                <label for="lang" class="mb-1.5 block text-[13px] text-text-tertiary">{{ tr('简报正文语言', 'Brief content language') }}</label>
                <select
                  id="lang"
                  v-model="form.language"
                  class="w-full rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-[14px] text-text-primary outline-none transition-colors focus:border-cyber-blue/50 [color-scheme:dark]"
                >
                  <option value="zh">{{ tr('中文', 'Chinese') }}</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 校验提示 -->
          <p v-if="validationError" class="mb-3 text-[14px] text-cyber-error">
            {{ validationError }}
          </p>

          <!-- 提交 -->
          <button
            type="submit"
            :disabled="isGenerating"
            class="button-energy group relative w-full overflow-hidden rounded-lg bg-cyber-blue px-4 py-3.5 text-[16px] font-semibold text-[#06121c] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#7bd3ed] hover:shadow-[0_12px_30px_rgba(85,195,231,0.2)] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-text-tertiary disabled:shadow-none"
          >
            <span class="flex items-center justify-center gap-2">
              <svg
                v-if="isGenerating"
                class="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{{ isGenerating ? tr('正在研究', 'Researching') : tr('生成简报', 'Generate brief') }}</span>
              <svg
                v-if="!isGenerating"
                class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          <p class="mt-3 text-center text-[13px] text-text-tertiary">
            {{ tr('研究窗口为会议时间前 30 天', 'Research covers the 30 days before the meeting') }}
          </p>
        </form>

        <!-- 演示状态入口 -->
        <div class="mt-5">
          <p class="mb-2.5 text-[13px] uppercase tracking-wider text-text-tertiary">{{ tr('演示数据', 'Demo data') }}</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="mode in demoModes"
              :key="mode.value"
              type="button"
              class="rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-left text-[14px] text-text-secondary transition-all duration-200 hover:border-cyber-blue/30 hover:bg-cyber-blue/[0.05] hover:text-text-primary"
              @click="loadDemo(mode.value)"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- 研究流程：说明后端真实执行的六个阶段 -->
    <section class="mt-16 border-t border-white/[0.06] pt-6 no-print">
      <p class="mb-4 text-[12px] uppercase tracking-[0.16em] text-text-tertiary">{{ tr('研究流程', 'Research workflow') }}</p>
      <ol class="flex flex-wrap items-center gap-x-2 gap-y-2">
        <li v-for="(stage, index) in pipeline" :key="stage.key" class="flex items-center gap-2">
          <span class="flex items-center gap-1.5 rounded border border-white/[0.08] bg-white/[0.02] px-2 py-1">
            <span class="font-mono text-[12px] text-cyber-blue/80">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="text-[13px] text-text-secondary">{{ stage.label }}</span>
          </span>
          <svg
            v-if="index < pipeline.length - 1"
            class="h-3 w-3 text-white/15"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </li>
      </ol>
      <p class="mt-4 max-w-2xl text-[13px] leading-relaxed text-text-tertiary">
        {{ tr('进度条显示的是后端推进的真实阶段，不是预估动画。任一阶段失败都会中断流并给出重试入口。', 'Progress follows real backend stages, not an estimated animation. If a stage fails, you can retry.') }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBriefing } from '../composables/useBriefing'
import { useDemoMode, type DemoMode } from '../composables/useDemoMode'
import type { BriefingRequest } from '../types'
import { locale, tr } from '../composables/useLocale'

const router = useRouter()
const { generate, isGenerating, reset } = useBriefing()
const { isDemoMode, setDemoMode, exitDemoMode } = useDemoMode()

const showAdvanced = ref(false)
const validationError = ref('')

const form = ref({
  entity: '',
  entity_type: 'company' as 'company' | 'person',
  organization: '',
  official_domain: '',
  attendee: '',
  meeting_datetime: '',
  meeting_goal: '',
  language: locale.value
})

watch(locale, (next) => {
  form.value.language = next
  validationError.value = ''
})

const entityTypes = computed(() => [
  { value: 'company' as const, label: tr('公司', 'Company') },
  { value: 'person' as const, label: tr('人物', 'Person') }
])

const demoModes = computed<{ value: DemoMode; label: string }[]>(() => [
  { value: 'completed', label: tr('完整结果', 'Complete') },
  { value: 'partial', label: tr('部分证据', 'Partial') },
  { value: 'insufficient', label: tr('证据不足', 'Insufficient') },
  { value: 'error', label: tr('流中断', 'Error') }
])

/** 与后端 progress 事件的 stage 顺序保持一致 */
const pipeline = computed(() => [
  { key: 'plan', label: tr('规划检索', 'Plan searches') },
  { key: 'search', label: tr('检索来源', 'Find sources') },
  { key: 'assess', label: tr('评估证据', 'Assess evidence') },
  { key: 'draft', label: tr('起草动态', 'Draft developments') },
  { key: 'verify', label: tr('校验引文', 'Verify quotes') },
  { key: 'compose', label: tr('组织简报', 'Compose brief') }
])

/** 内联 SVG 图标，避免引入额外图标依赖 */
function icon(path: string) {
  return () =>
    h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', 'aria-hidden': 'true' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: path })
    ])
}

const capabilities = computed(() => [
  {
    title: tr('逐条核验正文引文', 'Quotes checked against source text'),
    desc: tr('搜索摘要不能充当引述；只有网页正文匹配到的原句才会进入简报。', 'Search summaries cannot serve as quotes. Only passages found in article text enter the brief.'),
    icon: icon('M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z')
  },
  {
    title: tr('严格的日期窗口', 'A strict 30-day window'),
    desc: tr('以会议时间倒推 30 天；无发布日期的结果会被排除，不猜测事件日。', 'The window is anchored to the meeting. Undated results are excluded; event dates are not guessed.'),
    icon: icon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z')
  },
  {
    title: tr('可直接发问的问题', 'Questions ready for the meeting'),
    desc: tr('每个问题都绑定已核实的动态，点一下就能回到对应事实。', 'Each question links to a verified development so you can trace its basis.'),
    icon: icon('M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093M12 17h.01')
  }
])

/** 会议时间必须带时区偏移，否则后端返回 422。 */
function getTimezoneOffset(): string {
  const offset = -new Date().getTimezoneOffset()
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  const sign = offset >= 0 ? '+' : '-'
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function handleSubmit() {
  validationError.value = ''

  const entity = form.value.entity.trim()
  if (entity.length < 2) {
    validationError.value = tr('研究对象至少需要 2 个字符', 'Enter at least two characters for the subject')
    return
  }
  if (!form.value.meeting_datetime) {
    validationError.value = tr('请选择会议时间', 'Choose a meeting time')
    return
  }

  const request: BriefingRequest = {
    entity,
    entity_type: form.value.entity_type,
    meeting_at: `${form.value.meeting_datetime}:00${getTimezoneOffset()}`,
    meeting_goal: form.value.meeting_goal.trim() || tr('商务合作交流', 'Explore a business partnership'),
    language: form.value.language
  }

  if (form.value.organization.trim()) request.organization = form.value.organization.trim()
  if (form.value.official_domain.trim()) request.official_domain = form.value.official_domain.trim()
  if (form.value.attendee.trim()) request.attendee = form.value.attendee.trim()

  exitDemoMode()
  // 先跳转再在后台消费 SSE，这样进度视图才能实时呈现阶段
  generate(request)
  router.push({ path: '/briefing' })
}

function loadDemo(mode: DemoMode) {
  reset()
  setDemoMode(mode)
  router.push({ path: '/briefing', query: { demo: mode } })
}
</script>
