import type { DateBasis, SourceType } from '../types'
import { tr } from '../composables/useLocale'

/**
 * 来源类型标记的唯一含义是「网址是否匹配用户提供的官网域名」。
 * 这里连带给出提示文案，避免在多个组件里重复措辞、也避免被读成可信度。
 */
export const SOURCE_TYPE_META: Record<
  SourceType,
  { label: string; hint: string; className: string }
> = {
  official: {
    label: '官方域名',
    hint: '网址匹配你提供的官网域名，仅此含义，不代表内容经第三方独立证实',
    className: 'border-cyber-success/30 bg-cyber-success/10 text-cyber-success'
  },
  external: {
    label: '外部媒体',
    hint: '网址不属于用户提供的官网域名',
    className: 'border-white/15 bg-white/[0.04] text-text-secondary'
  },
  unclassified: {
    label: '未分类',
    hint: '未提供官网域名，因此没有做官方/外部标记，不代表来源不可靠',
    className: 'border-white/15 bg-white/[0.04] text-text-secondary'
  }
}

/** 日期基准的展示文案：source_publication 只能用「来源发布日期」。 */
export const DATE_BASIS_META = {
  explicit_event_date: {
    label: '事件日期',
    hint: '该日期由来源正文中的明确时间表述支持'
  },
  source_publication: {
    label: '来源发布日期',
    hint: '正文未给出明确事件日，这里使用来源的发布日期作为代理'
  }
} as const

export function sourceTypeMeta(type: SourceType) {
  const meta = SOURCE_TYPE_META[type]
  const english = {
    official: { label: 'Official domain', hint: 'URL matches the official domain you supplied. This does not mean independent verification.' },
    external: { label: 'External source', hint: 'URL does not match the official domain you supplied.' },
    unclassified: { label: 'Unclassified', hint: 'No official domain was supplied. This does not imply the source is unreliable.' }
  }[type]
  return { ...meta, label: tr(meta.label, english.label), hint: tr(meta.hint, english.hint) }
}

export function dateBasisMeta(basis: DateBasis) {
  const meta = DATE_BASIS_META[basis]
  const english = {
    explicit_event_date: { label: 'Event date', hint: 'The source text explicitly supports this date.' },
    source_publication: { label: 'Source publication date', hint: 'The article does not state an event date; its publication date is used as a proxy.' }
  }[basis]
  return { label: tr(meta.label, english.label), hint: tr(meta.hint, english.hint) }
}
