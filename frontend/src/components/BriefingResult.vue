<template>
  <div class="mx-auto max-w-6xl px-5 py-10 print:hidden md:px-8 md:py-14" :class="isDemo ? 'pb-24' : ''">
    <!-- 演示数据横幅（打印版自带声明，这里只管屏幕） -->
    <div
      v-if="isDemo"
      class="mb-6 flex items-start gap-2.5 rounded-lg border border-cyber-warning/30 bg-cyber-warning/[0.07] px-4 py-3 no-print"
    >
      <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyber-warning"></span>
      <p class="flex-1 text-[14px] leading-relaxed text-cyber-warning">
        {{ tr('演示数据：以下公司、来源与结论均为虚构样例，用于展示界面状态，不是真实研究结果。', 'Demo data: the company, sources, and conclusions below are fictional and do not represent live research.') }}
      </p>
      <button
        class="shrink-0 text-[14px] text-cyber-warning/70 underline underline-offset-2 transition-colors hover:text-cyber-warning"
        @click="$emit('exitDemo')"
      >
        {{ tr('退出演示', 'Exit demo') }}
      </button>
    </div>

    <!-- 简报头 -->
    <header class="mb-9 rounded-2xl border border-white/[0.09] bg-dark-card/65 p-6 shadow-[0_20px_55px_rgba(2,8,17,0.2)] md:p-8">
      <div class="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div class="min-w-0">
          <p class="mb-2 flex items-center gap-2 text-[13px] uppercase tracking-[0.18em] text-text-tertiary">
            <span class="h-px w-5 bg-cyber-blue/50"></span>
            {{ result.entity_type === 'person' ? tr('人物简报', 'Person brief') : tr('公司简报', 'Company brief') }}
            <span class="text-white/10">·</span>
            <span class="normal-case tracking-normal text-text-secondary">{{ result.entity }}</span>
          </p>

          <h1 class="text-balance text-[1.8rem] font-semibold leading-[1.2] tracking-tight text-text-primary md:text-[2.4rem]">
            {{ result.headline }}
          </h1>

          <p class="mt-3 max-w-2xl text-[16px] leading-relaxed text-text-secondary">
            <span class="text-text-tertiary">{{ tr('会议目的：', 'Meeting goal: ') }}</span>{{ result.meeting_goal }}
          </p>
        </div>

        <!-- 操作 -->
        <div class="flex shrink-0 flex-wrap items-center gap-2 no-print">
          <button
            class="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[14px] text-text-secondary transition-all duration-200 hover:border-cyber-blue/30 hover:text-text-primary"
            @click="copyBriefing"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {{ copied ? tr('已复制', 'Copied') : tr('复制', 'Copy') }}
          </button>

          <button
            class="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[14px] text-text-secondary transition-all duration-200 hover:border-cyber-blue/30 hover:text-text-primary"
            @click="$emit('preview')"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {{ tr('打印预览', 'Print preview') }}
          </button>

          <button
            class="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[14px] text-text-secondary transition-all duration-200 hover:border-cyber-blue/30 hover:text-text-primary"
            @click="printBriefing"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            {{ tr('打印', 'Print') }}
          </button>

          <router-link
            to="/"
            class="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[14px] text-text-secondary transition-all duration-200 hover:border-cyber-blue/30 hover:text-text-primary"
          >
            {{ tr('新建', 'New brief') }}
          </router-link>
        </div>
      </div>

      <!-- 元信息 -->
      <dl class="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-white/[0.08] pt-6 sm:grid-cols-4">
        <div v-for="item in metaItems" :key="item.label" class="min-w-0">
          <dt class="mb-1 text-[12px] uppercase tracking-[0.14em] text-text-tertiary">{{ item.label }}</dt>
          <dd class="break-words font-mono text-[14px] leading-relaxed" :class="item.className">{{ item.value }}</dd>
        </div>
      </dl>

      <p v-if="!isDemo && result.language !== locale" class="mt-4 text-[13px] text-text-secondary">
        {{ tr('这份简报正文保持生成时的语言；如需另一种正文语言，请重新生成。', 'The research text keeps its original language. Generate a new brief to change the content language.') }}
      </p>

      <!-- 图例：把「事实」与「推断」的区分前置 -->
      <div
        v-if="result.developments.length > 0"
        class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-text-tertiary"
      >
        <span class="flex items-center gap-1.5">
          <span class="h-1.5 w-1.5 rounded-full bg-cyber-blue"></span>
          {{ tr('已核实事实', 'Verified fact') }}
        </span>
        <span class="flex items-center gap-1.5">
          <span class="h-1.5 w-1.5 rounded-full bg-cyber-purple"></span>
          {{ tr('会议推断（基于事实的解读）', 'Meeting implication (interpretation)') }}
        </span>
        <span class="flex items-center gap-1.5">
          <span class="rounded border border-white/15 px-1 py-px font-mono text-[12px]">S1</span>
          {{ tr('可展开来源引文', 'Expandable source quote') }}
        </span>
      </div>
    </header>

    <!-- 研究局限 -->
    <section
      v-if="result.gaps.length > 0"
      class="mb-6 rounded-lg border border-cyber-warning/25 bg-cyber-warning/[0.05] px-4 py-3.5"
    >
      <h2 class="mb-2 flex items-center gap-1.5 text-[13px] uppercase tracking-wider text-cyber-warning">
        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
        {{ tr('研究局限与未通过核验的内容', 'Research limits and rejected claims') }}
      </h2>
      <ul class="space-y-1">
        <li
          v-for="(gap, index) in result.gaps"
          :key="index"
          class="flex gap-2 text-[14px] leading-relaxed text-text-secondary"
        >
          <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyber-warning/60"></span>
          {{ gap }}
        </li>
      </ul>
    </section>

    <!-- 证据不足空状态 -->
    <section
      v-if="result.developments.length === 0"
      class="rounded-xl border border-white/[0.08] bg-dark-card/60 px-6 py-14 text-center"
    >
      <span class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
        <svg class="h-5 w-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
        </svg>
      </span>
      <h2 class="text-lg font-medium text-text-primary">{{ tr('没有可核实的近期动态', 'No verifiable recent developments') }}</h2>
      <p class="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-text-secondary">
        {{ tr('在会议前 30 天的窗口内，没有找到既有明确日期、又能匹配到正文引文的报道。简报不会用未核实的内容填充版面。', 'Within the 30 days before the meeting, no dated article with a matching source quote was found. The brief will not fill space with unverified claims.') }}
      </p>
      <div class="mt-6 flex flex-wrap items-center justify-center gap-2">
        <router-link
          to="/"
          class="rounded-md bg-cyber-blue px-3.5 py-2 text-[14px] font-medium text-[#06121c] transition-colors hover:bg-[#22b3f2]"
        >
          {{ tr('换个研究对象', 'Try another subject') }}
        </router-link>
        <button
          class="rounded-md border border-white/10 px-3.5 py-2 text-[14px] text-text-secondary transition-colors hover:text-text-primary"
          @click="printBriefing"
        >
          {{ tr('打印当前结论', 'Print this outcome') }}
        </button>
      </div>
    </section>

    <div v-else class="space-y-8">
      <!-- 动态时间线 -->
      <section id="developments" class="scroll-mt-24">
        <div class="mb-4 flex items-baseline gap-3">
          <h2 class="text-xl font-semibold tracking-tight text-text-primary">{{ tr('最近动态', 'Recent developments') }}</h2>
          <span class="font-mono text-[13px] text-text-tertiary">
            {{ String(result.developments.length).padStart(2, '0') }} {{ tr('条已核实', 'verified') }}
          </span>
          <span class="ml-auto hidden items-center gap-1.5 text-[12px] text-text-tertiary xl:flex">
            <kbd class="rounded border border-white/[0.12] px-1 py-px font-mono text-[10px]">J</kbd>
            <kbd class="rounded border border-white/[0.12] px-1 py-px font-mono text-[10px]">K</kbd>
            {{ tr('切换证据 · Enter 打开来源', 'move · Enter opens source') }}
          </span>
        </div>

        <ol class="relative">
          <li
            v-for="(dev, index) in result.developments"
            :key="dev.id"
            v-reveal="index"
            :ref="(el) => registerDevEl(dev.id, el)"
            class="relative pb-5 pl-6 last:pb-0 md:pl-8"
          >
            <!-- 时间轴 -->
            <span
              class="absolute left-0 top-[7px] h-2 w-2 rounded-full transition-all duration-300"
              :class="highlighted[dev.id] ? 'bg-cyber-blue shadow-[0_0_12px_rgba(14,165,233,0.8)]' : 'bg-cyber-blue/80'"
              aria-hidden="true"
            ></span>
            <span
              v-if="index < result.developments.length - 1"
              class="absolute bottom-0 left-[3.5px] top-5 w-px bg-white/[0.09]"
              aria-hidden="true"
            ></span>

            <div
              class="interactive-card relative rounded-xl border p-5 shadow-[0_8px_24px_rgba(2,8,17,0.1)] transition-colors duration-300 md:p-6"
              :class="
                highlighted[dev.id] || activeDevId === dev.id
                  ? 'border-cyber-blue/40 bg-cyber-blue/[0.07]'
                  : 'border-white/[0.08] bg-dark-card/55'
              "
            >
            <!-- 日期行 -->
            <div class="mb-2.5 flex flex-wrap items-center gap-2">
              <time class="font-mono text-[15px] text-text-primary">{{ dev.date }}</time>
              <button
                class="group inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[12px] transition-colors"
                :class="
                  dev.date_basis === 'explicit_event_date'
                    ? 'border-cyber-success/25 bg-cyber-success/[0.08] text-cyber-success'
                    : 'border-white/[0.12] bg-white/[0.03] text-text-tertiary hover:border-white/25'
                "
                :title="dateBasisMeta(dev.date_basis).hint + (dev.date_evidence ? tr('（点按查看日期依据）', ' (click to view date evidence)') : '')"
                @click="openDateEvidence(dev)"
              >
                {{ dateBasisMeta(dev.date_basis).label }}
                <svg
                  v-if="dev.date_evidence"
                  class="h-2.5 w-2.5 opacity-50 transition-opacity group-hover:opacity-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- 已核实事实 -->
            <div class="group/fact">
              <p class="text-[17px] leading-relaxed text-text-primary">{{ dev.fact }}</p>

              <!-- 引文 -->
              <div class="mt-2.5 flex flex-wrap items-start gap-1.5">
                <button
                  v-for="citation in dev.citations"
                  :key="citation.source_id"
                  class="inline-flex max-w-full items-start gap-1.5 rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-left text-[13px] text-text-secondary transition-all duration-200 hover:border-cyber-blue/40 hover:bg-cyber-blue/[0.06] hover:text-text-primary"
                  :title="tr(`查看 ${citation.source_id} 的原文摘录`, `View original quote from ${citation.source_id}`)"
                  @click="openCitation(citation.source_id, citation.quote)"
                  @mouseenter="showPreview($event, citation)"
                  @mouseleave="hidePreview"
                  @focus="showPreview($event, citation)"
                  @blur="hidePreview"
                >
                  <span class="mt-px shrink-0 font-mono text-[12px] text-cyber-blue">{{ citation.source_id }}</span>
                  <span class="line-clamp-2 max-w-[30rem] leading-snug">“{{ citation.quote }}”</span>
                </button>
              </div>
            </div>

            <!-- 会议推断 -->
            <div class="mt-3.5 rounded-lg border border-cyber-purple/20 bg-cyber-purple/[0.05] px-3.5 py-3">
              <p class="mb-1 flex items-center gap-1.5 text-[12px] uppercase tracking-[0.12em] text-cyber-purple">
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0"
                  />
                </svg>
                {{ tr('会议推断', 'Meeting implication') }}
              </p>
              <p class="text-[15px] leading-relaxed text-text-secondary">{{ dev.meeting_implication }}</p>
            </div>
            </div>
          </li>
        </ol>
      </section>

      <!-- 建议问题 -->
      <section v-if="result.questions.length > 0" id="questions" class="scroll-mt-24">
        <div class="mb-4 flex items-baseline gap-3">
          <h2 class="text-xl font-semibold tracking-tight text-text-primary">{{ tr('会上可以问', 'Questions to ask') }}</h2>
          <span class="font-mono text-[13px] text-text-tertiary">
            {{ String(result.questions.length).padStart(2, '0') }} {{ tr('个问题', 'questions') }}
          </span>
        </div>

        <ul class="space-y-2">
          <li v-for="(question, index) in result.questions" :key="index" v-reveal="index">
            <button
              class="interactive-card group w-full rounded-xl border border-white/[0.08] bg-dark-card/55 px-5 py-4 text-left shadow-[0_8px_24px_rgba(2,8,17,0.1)] transition-all duration-200 hover:border-cyber-blue/30 hover:bg-dark-elevated/70"
              @click="focusDevelopments(question.development_ids)"
            >
              <div class="flex items-start gap-3">
                <span class="mt-0.5 font-mono text-[13px] text-cyber-blue/70">{{ String(index + 1).padStart(2, '0') }}</span>
                <div class="min-w-0 flex-1">
                  <p class="text-[16px] leading-relaxed text-text-primary">{{ question.question }}</p>
                  <p class="mt-1.5 text-[14px] leading-relaxed text-text-tertiary">{{ question.reason }}</p>
                </div>
                <span
                  v-if="question.development_ids.length > 0"
                  class="mt-0.5 flex shrink-0 items-center gap-1 rounded border border-white/10 px-1.5 py-0.5 text-[12px] text-text-tertiary transition-colors group-hover:border-cyber-blue/30 group-hover:text-cyber-blue"
                  :title="tr('定位到关联动态', 'Jump to related developments')"
                >
                  {{ tr('关联', 'Related') }} {{ question.development_ids.length }}
                  <svg class="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              </div>
            </button>
          </li>
        </ul>
      </section>

      <!-- 来源 -->
      <section v-if="result.sources.length > 0" id="sources" class="scroll-mt-24">
        <div class="mb-4 flex items-baseline gap-3">
          <h2 class="text-xl font-semibold tracking-tight text-text-primary">{{ tr('信息来源', 'Sources') }}</h2>
          <span class="font-mono text-[13px] text-text-tertiary">
            {{ String(result.sources.length).padStart(2, '0') }} {{ tr('条', 'sources') }}
          </span>
        </div>

        <ul class="divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.08] bg-dark-card/45">
          <li v-for="(source, index) in result.sources" :key="source.id" v-reveal="Math.min(index, 8)">
            <div class="flex items-start gap-3 px-4 py-3 transition-colors duration-200 hover:bg-white/[0.025]">
              <span class="mt-0.5 shrink-0 font-mono text-[13px] text-cyber-blue">{{ source.id }}</span>

              <div class="min-w-0 flex-1">
                <button
                  class="block max-w-full truncate text-left text-[15px] text-text-primary transition-colors hover:text-cyber-blue"
                  @click="openSource(source.id)"
                >
                  {{ source.title }}
                </button>
                <p class="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-text-tertiary">
                  <span class="font-mono" :title="source.published_at">{{ formatDateOnly(source.published_at) }}</span>
                  <span class="text-white/10">·</span>
                  <span
                    class="rounded border px-1 py-px text-[12px]"
                    :class="sourceTypeMeta(source.source_type).className"
                    :title="sourceTypeMeta(source.source_type).hint"
                  >
                    {{ sourceTypeMeta(source.source_type).label }}
                  </span>
                </p>
                <!-- 打印版保留完整 URL -->
                <p class="mt-1 hidden break-all font-mono text-[9pt] text-text-tertiary print:block">
                  {{ source.url }}
                </p>
              </div>

              <a
                :href="source.url"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-0.5 shrink-0 rounded p-1.5 text-text-tertiary transition-colors hover:bg-white/[0.05] hover:text-cyber-blue"
                :title="source.url"
                :aria-label="tr(`打开 ${source.title}`, `Open ${source.title}`)"
              >
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </li>
        </ul>

        <p class="mt-2.5 text-[13px] leading-relaxed text-text-tertiary">
          {{ tr('「官方域名」仅表示网址匹配你提供的官网，不代表内容经第三方独立证实。搜索摘要不作为原文引述。', '“Official domain” only means the URL matches the domain you supplied. It is not independent verification. Search summaries are not original quotes.') }}
        </p>
      </section>

      <!-- 处理统计 -->
      <section class="border-t border-white/[0.07] pt-4 no-print">
        <p class="mb-2 text-[12px] uppercase tracking-[0.14em] text-text-tertiary">{{ tr('处理统计', 'Processing counts') }}</p>
        <dl class="flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[13px] text-text-tertiary">
          <div v-for="stat in statItems" :key="stat.label" class="flex items-center gap-1.5">
            <dt>{{ stat.label }}</dt>
            <dd class="text-text-secondary"><CountNumber :value="stat.value" /></dd>
          </div>
        </dl>
        <p class="mt-2 text-[12px] leading-relaxed text-text-tertiary">
          {{ tr('以上为本次研究流程的处理计数，不是可信度评分。', 'These are processing counts, not a confidence score.') }}
        </p>
      </section>
    </div>

    <!-- 来源详情侧栏 -->
    <SourcePanel :open="panelOpen" :source="panelSource" :quote="panelQuote" @close="panelOpen = false" />

    <!-- 引文悬停预览：桌面端减少一次跳转，点按仍然打开完整侧栏 -->
    <CitationPreview
      :open="preview.open"
      :x="preview.x"
      :y="preview.y"
      :source-id="preview.sourceId"
      :quote="preview.quote"
      :title="preview.title"
      :published="preview.published"
    />

    <!-- 阅读进度与章节索引 -->
    <ReadingRail v-if="result.developments.length > 0" :sections="railSections" />
  </div>

  <!-- 打印版：独立的一页排版，与屏幕版共用同一份数据 -->
  <div class="hidden print:block">
    <PrintBriefing :result="result" :is-demo="isDemo" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import type { BriefingResult, Citation, Development } from '../types'
import SourcePanel from './SourcePanel.vue'
import PrintBriefing from './PrintBriefing.vue'
import CitationPreview from './CitationPreview.vue'
import ReadingRail from './ReadingRail.vue'
import CountNumber from './CountNumber.vue'
import { dateBasisMeta, sourceTypeMeta } from '../lib/sourceType'
import { formatDateCompact, formatDateOnly, formatDateTime } from '../lib/format'
import { buildBriefText } from '../lib/briefText'
import { locale, tr } from '../composables/useLocale'

const props = defineProps<{
  result: BriefingResult
  isDemo: boolean
}>()

defineEmits<{
  exitDemo: []
  preview: []
}>()

/* ---------- 来源侧栏 ---------- */
const panelOpen = ref(false)
const panelSourceId = ref<string | null>(null)
const panelQuote = ref<string | null>(null)

const panelSource = computed(
  () => props.result.sources.find((item) => item.id === panelSourceId.value) ?? null
)

function openCitation(sourceId: string, quote: string) {
  panelSourceId.value = sourceId
  panelQuote.value = quote
  panelOpen.value = true
}

function openSource(sourceId: string) {
  panelSourceId.value = sourceId
  panelQuote.value = null
  panelOpen.value = true
}

/** 日期依据同样是引文，点开同一个侧栏查看 */
function openDateEvidence(dev: Development) {
  if (!dev.date_evidence) return
  openCitation(dev.date_evidence.source_id, dev.date_evidence.quote)
}

/* ---------- 动态高亮定位 ---------- */
const devRefs = new Map<string, HTMLElement>()
const highlighted = reactive<Record<string, boolean>>({})

function registerDevEl(id: string, el: unknown) {
  if (el instanceof HTMLElement) devRefs.set(id, el)
  else devRefs.delete(id)
}

function focusDevelopments(ids: string[]) {
  const first = ids[0]
  if (!first) return

  ids.forEach((id) => {
    highlighted[id] = true
    window.setTimeout(() => {
      highlighted[id] = false
    }, 1800)
  })

  devRefs.get(first)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

/* ---------- 引文悬停预览 ---------- */
const preview = reactive({
  open: false,
  x: 0,
  y: 0,
  sourceId: '',
  quote: '',
  title: '',
  published: ''
})

const PREVIEW_WIDTH = 320
const PREVIEW_HEIGHT = 168

/** 只在精确指针设备上启用悬停预览；触屏点按直接开侧栏。 */
function showPreview(event: Event, citation: Citation) {
  if (typeof window === 'undefined') return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  const source = props.result.sources.find((item) => item.id === citation.source_id)
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()

  // 优先放在引文上方，靠近视口顶部时翻到下方；左右夹在视口内
  const above = rect.top > PREVIEW_HEIGHT + 16
  const left = Math.min(
    Math.max(12, rect.left),
    Math.max(12, window.innerWidth - PREVIEW_WIDTH - 12)
  )

  preview.open = true
  preview.x = left
  preview.y = above ? rect.top - PREVIEW_HEIGHT - 10 : rect.bottom + 10
  preview.sourceId = citation.source_id
  preview.quote = citation.quote
  preview.title = source?.title ?? tr('来源信息缺失', 'Source details unavailable')
  preview.published = source ? formatDateOnly(source.published_at) : ''
}

function hidePreview() {
  preview.open = false
}

/* ---------- 键盘导航：J/K 切换证据，Enter 打开来源，Esc 关闭 ---------- */
const activeDevId = ref<string | null>(null)

function stepDevelopment(delta: number) {
  const list = props.result.developments
  if (list.length === 0) return

  const current = activeDevId.value ? list.findIndex((item) => item.id === activeDevId.value) : -1
  const next = current < 0 ? (delta > 0 ? 0 : list.length - 1) : Math.min(list.length - 1, Math.max(0, current + delta))
  const target = list[next]
  if (!target) return

  activeDevId.value = target.id
  devRefs.get(target.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  const typing =
    !!target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable)

  if (event.key === 'Escape') {
    if (panelOpen.value) panelOpen.value = false
    else if (preview.open) preview.open = false
    return
  }

  if (typing || event.metaKey || event.ctrlKey || event.altKey) return

  const key = event.key.toLowerCase()
  if (key === 'j') {
    event.preventDefault()
    stepDevelopment(1)
    return
  }
  if (key === 'k') {
    event.preventDefault()
    stepDevelopment(-1)
    return
  }
  if (event.key === 'Enter' && activeDevId.value) {
    const dev = props.result.developments.find((item) => item.id === activeDevId.value)
    const citation = dev?.citations[0]
    if (!citation) return
    event.preventDefault()
    openCitation(citation.source_id, citation.quote)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const railSections = computed(() => {
  const sections = [{ id: 'developments', label: tr('动态', 'Developments') }]
  if (props.result.questions.length > 0) sections.push({ id: 'questions', label: tr('问题', 'Questions') })
  if (props.result.sources.length > 0) sections.push({ id: 'sources', label: tr('来源', 'Sources') })
  return sections
})

/* ---------- 元信息与统计 ---------- */
function statusMeta(status: BriefingResult['status']) {
  return {
    completed: { label: tr('研究完成', 'Complete'), className: 'text-cyber-success' },
    partial: { label: tr('部分证据', 'Partial evidence'), className: 'text-cyber-warning' },
    insufficient_evidence: { label: tr('证据不足', 'Insufficient evidence'), className: 'text-text-tertiary' }
  }[status]
}

const metaItems = computed(() => {
  const r = props.result
  const status = statusMeta(r.status)
  return [
    { label: tr('会议时间', 'Meeting time'), value: formatDateTime(r.meeting_at), className: 'text-text-primary' },
    {
      label: tr('研究窗口', 'Research window'),
      value: `${formatDateCompact(r.window_start)} → ${formatDateCompact(r.window_end)}`,
      className: 'text-text-secondary'
    },
    {
      label: tr('生成时间', 'Generated'),
      value: r.generated_at ? formatDateTime(r.generated_at) : '—',
      className: 'text-text-secondary'
    },
    { label: tr('研究状态', 'Status'), value: status.label, className: status.className }
  ]
})

const statItems = computed(() => {
  const s = props.result.research_stats
  return [
    { label: tr('检索轮次', 'Search rounds'), value: s.search_rounds ?? 0 },
    { label: tr('候选结果', 'Results seen'), value: s.search_results_seen ?? 0 },
    { label: tr('排除无日期', 'Undated excluded'), value: s.excluded_undated ?? 0 },
    { label: tr('超出窗口', 'Outside window'), value: s.excluded_outside_window ?? 0 },
    { label: tr('无正文', 'No article text'), value: s.excluded_no_full_text ?? 0 },
    { label: tr('重复网址', 'Duplicate URLs'), value: s.excluded_duplicate_url ?? 0 },
    { label: tr('审查来源', 'Sources reviewed'), value: s.sources_reviewed ?? 0 },
    { label: tr('草稿被拒', 'Drafts rejected'), value: s.drafts_rejected ?? 0 },
    { label: tr('核实动态', 'Verified items'), value: s.developments_verified ?? 0 }
  ]
})

/* ---------- 复制 / 打印 ---------- */
const copied = ref(false)

function copyBriefing() {
  navigator.clipboard
    .writeText(buildBriefText(props.result, props.isDemo))
    .then(() => {
      copied.value = true
      window.setTimeout(() => {
        copied.value = false
      }, 1800)
    })
    .catch(() => {
      copied.value = false
      window.alert(tr('复制失败，请手动选择文本复制。', 'Copy failed. Please select and copy the text manually.'))
    })
}

function printBriefing() {
  window.print()
}
</script>
