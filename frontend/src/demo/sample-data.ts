import type { BriefingResult } from '../types'

/**
 * 虚构演示数据 —— 公司、来源、结论全部为虚构，仅用于展示界面状态。
 * 结构严格对齐 BriefingResult，其中 D2 使用 source_publication 以展示日期基准差异。
 */
const sampleData: BriefingResult = {
  entity: '示例公司',
  entity_type: 'company',
  organization: null,
  attendee: '示例公司产品负责人',
  official_domain: 'example.org',
  meeting_at: '2026-11-12T15:00:00+08:00',
  meeting_goal: '讨论产品合作',
  language: 'zh',
  window_start: '2026-10-13T15:00:00+08:00',
  window_end: '2026-11-10T15:00:00+08:00',
  generated_at: '2026-11-10T15:05:00+08:00',
  headline: '示例公司｜会前 30 天简报',
  developments: [
    {
      id: 'D1',
      date: '2026-11-05',
      date_basis: 'explicit_event_date',
      date_evidence: { source_id: 'S1', quote: '11月5日' },
      fact: '示例公司发布了新的企业协作功能，支持跨组织共享工作区。',
      meeting_implication: '这可能为双方讨论产品集成提供切入点，尤其是权限与数据边界如何衔接。',
      citations: [{ source_id: 'S1', quote: '发布了新的企业协作功能' }]
    },
    {
      id: 'D2',
      date: '2026-10-29',
      date_basis: 'source_publication',
      date_evidence: null,
      fact: '多家行业媒体报道示例公司正在扩充其渠道合作伙伴计划。',
      meeting_implication: '若对方正在扩张渠道，合作形式可能更偏向联合销售而非单纯技术接入。',
      citations: [{ source_id: 'S2', quote: 'channel partner program' }]
    },
    {
      id: 'D3',
      date: '2026-10-21',
      date_basis: 'explicit_event_date',
      date_evidence: { source_id: 'S3', quote: '10月21日' },
      fact: '示例公司宣布与一家区域服务商达成联合交付协议。',
      meeting_implication: '对方已在尝试第三方交付，可能对交付质量与责任划分较为敏感。',
      citations: [{ source_id: 'S3', quote: '联合交付协议' }]
    },
    {
      id: 'D4',
      date: '2026-10-15',
      date_basis: 'source_publication',
      date_evidence: null,
      fact: '示例公司更新了开发者文档，新增企业级审计日志相关说明。',
      meeting_implication: '审计能力被摆到文档层面，说明合规可能是这次会议的隐性议题。',
      citations: [{ source_id: 'S4', quote: 'audit log' }]
    }
  ],
  questions: [
    {
      question: '新发布的协作功能，目前最希望哪类合作伙伴参与集成？',
      reason: '直接对应近期发布的企业协作功能，能快速判断你们的接入价值。',
      development_ids: ['D1']
    },
    {
      question: '渠道伙伴计划扩张后，联合销售的收益与责任如何划分？',
      reason: '来自渠道扩张与联合交付两条动态，关系到合作模式的实质条款。',
      development_ids: ['D2', 'D3']
    },
    {
      question: '企业级审计日志的能力边界在哪里，是否支持第三方导出？',
      reason: '文档层面的变化暗示合规诉求，可提前确认技术可行性。',
      development_ids: ['D4']
    }
  ],
  gaps: [],
  sources: [
    {
      id: 'S1',
      title: '示例公司发布企业协作功能（虚构）',
      url: 'https://example.org/fictional-announcement',
      query: '示例公司 企业协作 新功能',
      snippet: '11月5日，示例公司发布了新的企业协作功能，支持跨组织共享工作区。',
      published_at: '2026-11-06',
      retrieved_at: '2026-11-10T07:00:00Z',
      source_type: 'official'
    },
    {
      id: 'S2',
      title: '示例公司扩充渠道合作伙伴计划（虚构）',
      url: 'https://example.net/fictional-channel-news',
      query: '示例公司 渠道 合作伙伴',
      snippet: '据行业媒体报道，示例公司正在扩充其渠道合作伙伴计划。',
      published_at: '2026-10-29',
      retrieved_at: '2026-11-10T07:01:00Z',
      source_type: 'external'
    },
    {
      id: 'S3',
      title: '示例公司与区域服务商达成联合交付协议（虚构）',
      url: 'https://example.com/fictional-delivery-deal',
      query: '示例公司 联合交付 协议',
      snippet: '10月21日，示例公司宣布与一家区域服务商达成联合交付协议。',
      published_at: '2026-10-22',
      retrieved_at: '2026-11-10T07:02:00Z',
      source_type: 'external'
    },
    {
      id: 'S4',
      title: '示例公司开发者文档更新说明（虚构）',
      url: 'https://example.org/fictional-changelog',
      query: '示例公司 developer docs audit log',
      snippet: '示例公司更新了开发者文档，新增企业级审计日志相关说明。',
      published_at: '2026-10-15',
      retrieved_at: '2026-11-10T07:03:00Z',
      source_type: 'official'
    }
  ],
  trace: [
    { stage: 'compose', detail: 'Prepared 3 meeting questions', queries: [] }
  ],
  research_stats: {
    search_results_seen: 14,
    excluded_undated: 3,
    excluded_outside_window: 2,
    excluded_invalid: 1,
    excluded_duplicate_url: 2,
    excluded_no_full_text: 2,
    drafts_rejected: 1,
    duplicate_developments: 1,
    search_rounds: 2,
    sources_reviewed: 4,
    developments_verified: 4
  },
  status: 'completed'
}

export default sampleData
