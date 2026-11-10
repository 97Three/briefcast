/**
 * 日期格式化集中在这里，避免各组件对同一字段给出不同观感。
 * 后端的时间字段可能是 "2026-11-06"、"2026-11-05T17:00:49+00:00" 两种形态。
 */
import { locale, tr } from '../composables/useLocale'

function toDate(value: string): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** 只到日：用于来源列表等紧凑位置 */
export function formatDateOnly(value: string): string {
  if (!value) return tr('未标注日期', 'Date unavailable')
  const date = toDate(value)
  if (!date) return value
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 到分钟：用于会议时间、生成时间 */
export function formatDateTime(value: string): string {
  const date = toDate(value)
  if (!date) return value
  return date.toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/** 斜杠形式的短日期：用于研究窗口一行展示 */
export function formatDateCompact(value: string): string {
  const date = toDate(value)
  if (!date) return value
  return date.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
