import type { BriefingResult } from '../types'

/** 虚构演示数据：partial —— 只有部分证据通过核验，存在明确研究局限。 */
const partialData: BriefingResult = {
  entity: '示例材料公司',
  entity_type: 'company',
  organization: null,
  attendee: null,
  official_domain: null,
  meeting_at: '2026-11-15T14:00:00+08:00',
  meeting_goal: '评估供应链合作可行性',
  language: 'zh',
  window_start: '2026-10-16T14:00:00+08:00',
  window_end: '2026-11-10T15:00:00+08:00',
  generated_at: '2026-11-10T15:10:00+08:00',
  headline: '示例材料公司｜会前 30 天简报',
  developments: [
    {
      id: 'D1',
      date: '2026-11-01',
      date_basis: 'source_publication',
      date_evidence: null,
      fact: '示例材料公司公布了一项新材料中试线计划。',
      meeting_implication: '中试线通常意味着产能仍在验证阶段，交付周期可能是谈判重点。',
      citations: [{ source_id: 'S1', quote: '中试线计划' }]
    }
  ],
  questions: [
    {
      question: '中试线预计什么时候具备规模化供货能力？',
      reason: '现有公开信息只提到中试线，没有产能与时间表。',
      development_ids: ['D1']
    }
  ],
  gaps: [
    '未找到该公司近 30 天内的管理层或组织架构变动报道。',
    '有 3 条搜索结果缺少可解析的发布日期，已按要求排除。',
    '一份草稿中关于「新客户签约」的说法未能匹配到正文引文，已被拒绝。'
  ],
  sources: [
    {
      id: 'S1',
      title: '示例材料公司中试线计划（虚构）',
      url: 'https://example.net/fictional-pilot-line',
      query: '示例材料公司 中试线 产能',
      snippet: '示例材料公司公布了一项新材料中试线计划。',
      published_at: '2026-11-01',
      retrieved_at: '2026-11-10T08:00:00Z',
      source_type: 'unclassified'
    }
  ],
  trace: [
    { stage: 'compose', detail: 'Generated 1 question from partial evidence', queries: [] }
  ],
  research_stats: {
    search_results_seen: 11,
    excluded_undated: 3,
    excluded_outside_window: 2,
    excluded_invalid: 1,
    excluded_duplicate_url: 1,
    excluded_no_full_text: 2,
    drafts_rejected: 1,
    duplicate_developments: 0,
    search_rounds: 2,
    sources_reviewed: 1,
    developments_verified: 1
  },
  status: 'partial'
}

export default partialData
