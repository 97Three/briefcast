import type { BriefingResult } from '../types'
import { dateBasisMeta } from './sourceType'
import { formatDateCompact, formatDateOnly, formatDateTime } from './format'
import { tr } from '../composables/useLocale'

/** 状态文案：复制/导出的文本里也要和界面一致 */
function statusLabel(status: BriefingResult['status']): string {
  switch (status) {
    case 'completed':
      return tr('研究完成', 'Complete')
    case 'partial':
      return tr('部分证据', 'Partial evidence')
    case 'insufficient_evidence':
      return tr('证据不足', 'Insufficient evidence')
    default:
      return status
  }
}

/**
 * 简报的纯文本版本（复制到剪贴板 / 粘贴进会议记录）。
 * 独立成模块，让结果页与命令面板共用同一份导出逻辑，避免两处措辞漂移。
 * 保留来源编号与完整 URL，便于离线阅读。
 */
export function buildBriefText(result: BriefingResult, isDemo: boolean): string {
  const lines: string[] = []

  lines.push(result.headline)
  lines.push(`${tr('会议时间：', 'Meeting: ')}${formatDateTime(result.meeting_at)}`)
  lines.push(
    `${tr('研究窗口：', 'Research window: ')}${formatDateCompact(result.window_start)} → ${formatDateCompact(result.window_end)}`
  )
  lines.push(`${tr('会议目的：', 'Meeting goal: ')}${result.meeting_goal}`)
  lines.push(`${tr('研究状态：', 'Status: ')}${statusLabel(result.status)}`)
  if (isDemo) lines.push(tr('【演示数据，非真实研究结果】', '[Demo data, not live research]'))
  lines.push('')

  if (result.developments.length > 0) {
    lines.push(tr('## 最近动态', '## Recent developments'))
    result.developments.forEach((dev, index) => {
      lines.push('')
      lines.push(`${index + 1}. ${dev.date} (${dateBasisMeta(dev.date_basis).label})`)
      lines.push(`   ${tr('事实：', 'Fact: ')}${dev.fact}`)
      dev.citations.forEach((citation) =>
        lines.push(`   ${tr('引文', 'Quote')} [${citation.source_id}]: “${citation.quote}”`)
      )
      lines.push(`   ${tr('会议推断：', 'Meeting implication: ')}${dev.meeting_implication}`)
    })
    lines.push('')
  }

  if (result.questions.length > 0) {
    lines.push(tr('## 会上可以问', '## Questions to ask'))
    result.questions.forEach((question, index) => {
      lines.push(`${index + 1}. ${question.question}`)
      lines.push(`   ${tr('依据：', 'Why: ')}${question.reason}`)
    })
    lines.push('')
  }

  if (result.gaps.length > 0) {
    lines.push(tr('## 研究局限', '## Research limits'))
    result.gaps.forEach((gap) => lines.push(`- ${gap}`))
    lines.push('')
  }

  if (result.sources.length > 0) {
    lines.push(tr('## 信息来源', '## Sources'))
    result.sources.forEach((source) => {
      lines.push(`[${source.id}] ${source.title}`)
      lines.push(`     ${tr('发布日期：', 'Published: ')}${formatDateOnly(source.published_at)}`)
      lines.push(`     ${source.url}`)
    })
    lines.push('')
  }

  lines.push(
    tr(
      '（会议推断为基于事实的解读，非已核实事实。）',
      '(Meeting implications are interpretations, not verified facts.)'
    )
  )
  return lines.join('\n')
}
