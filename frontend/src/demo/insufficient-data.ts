import type { BriefingResult } from '../types'

/** 虚构演示数据：insufficient_evidence —— 没有任何动态通过核验。 */
const insufficientData: BriefingResult = {
  entity: '示例未公开公司',
  entity_type: 'company',
  organization: null,
  attendee: null,
  official_domain: null,
  meeting_at: '2026-11-20T10:00:00+08:00',
  meeting_goal: '初步商务接洽',
  language: 'zh',
  window_start: '2026-10-21T10:00:00+08:00',
  window_end: '2026-11-10T15:00:00+08:00',
  generated_at: '2026-11-10T15:15:00+08:00',
  headline: '示例未公开公司｜会前 30 天简报',
  developments: [],
  questions: [],
  gaps: [
    '在会议前 30 天窗口内，没有找到既带可解析日期、又能匹配到正文引文的报道。',
    '12 条搜索结果中有 7 条缺少发布日期，已排除。',
    '2 条结果的发布时间晚于会议时间，已排除。'
  ],
  sources: [],
  trace: [
    {
      stage: 'assess',
      detail: 'Insufficient dated evidence in search results',
      queries: ['示例未公开公司 新闻', '示例未公开公司 融资']
    }
  ],
  research_stats: {
    search_results_seen: 12,
    excluded_undated: 7,
    excluded_outside_window: 2,
    excluded_invalid: 1,
    excluded_duplicate_url: 1,
    excluded_no_full_text: 1,
    drafts_rejected: 0,
    duplicate_developments: 0,
    search_rounds: 2,
    sources_reviewed: 0,
    developments_verified: 0
  },
  status: 'insufficient_evidence'
}

export default insufficientData
