export type EntityType = 'company' | 'person'
export type Language = 'zh' | 'en'
export type DateBasis = 'explicit_event_date' | 'source_publication'
export type SourceType = 'official' | 'external' | 'unclassified'
export type BriefingStatus = 'completed' | 'partial' | 'insufficient_evidence'
export type ProgressStage = 'plan' | 'search' | 'assess' | 'draft' | 'verify' | 'compose'

export interface BriefingRequest {
  entity: string
  entity_type: EntityType
  organization?: string
  attendee?: string
  official_domain?: string
  meeting_at: string
  meeting_goal: string
  language: Language
}

export interface Citation {
  source_id: string
  quote: string
}

export interface Development {
  id: string
  date: string
  date_basis: DateBasis
  date_evidence: Citation | null
  fact: string
  meeting_implication: string
  citations: Citation[]
}

export interface Question {
  question: string
  reason: string
  development_ids: string[]
}

export interface Source {
  id: string
  title: string
  url: string
  query: string
  snippet: string
  published_at: string
  retrieved_at: string
  source_type: SourceType
}

export interface ResearchStats {
  search_results_seen: number
  excluded_undated: number
  excluded_outside_window: number
  excluded_invalid: number
  excluded_duplicate_url: number
  excluded_no_full_text: number
  drafts_rejected: number
  duplicate_developments: number
  search_rounds: number
  sources_reviewed: number
  developments_verified: number
}

export interface TraceStep {
  stage: string
  detail: string
  queries: string[]
}

export interface BriefingResult {
  entity: string
  entity_type: EntityType
  organization: string | null
  attendee: string | null
  official_domain: string | null
  meeting_at: string
  meeting_goal: string
  language: Language
  window_start: string
  window_end: string
  generated_at: string
  headline: string
  developments: Development[]
  questions: Question[]
  gaps: string[]
  sources: Source[]
  trace: TraceStep[]
  research_stats: ResearchStats
  status: BriefingStatus
}

export interface ProgressEvent {
  stage: ProgressStage
  detail: string
  queries: string[]
  search_rounds: number
  source_count: number
}

export interface ErrorEvent {
  message: string
  type: string
}

export interface HealthResponse {
  status: string
  deepseek_configured: boolean
  tavily_configured: boolean
}
