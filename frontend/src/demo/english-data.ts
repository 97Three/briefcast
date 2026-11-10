import type { BriefingResult } from '../types'
import sampleData from './sample-data'
import partialData from './partial-data'
import insufficientData from './insufficient-data'

export const sampleDataEn: BriefingResult = {
  ...sampleData,
  entity: 'Example Company',
  attendee: 'Product lead',
  meeting_goal: 'Discuss product partnership',
  language: 'en',
  headline: 'Example Company | 30-day meeting brief',
  developments: sampleData.developments.map((item, index) => ({
    ...item,
    fact: [
      'Example Company released an enterprise collaboration feature that supports shared workspaces across organizations.',
      'Industry outlets reported that Example Company is expanding its channel partner program.',
      'Example Company announced a joint delivery agreement with a regional service provider.',
      'Example Company updated its developer documentation with guidance on enterprise audit logs.'
    ][index],
    meeting_implication: [
      'This could open a discussion about product integration, especially permissions and data boundaries.',
      'Channel expansion could make joint selling more relevant than a simple technical integration.',
      'Third-party delivery may make delivery quality and responsibility important topics.',
      'The new documentation suggests compliance may be worth discussing in the meeting.'
    ][index],
    date_evidence: item.date_evidence ? { ...item.date_evidence, quote: index === 0 ? 'November 5' : 'October 21' } : null,
    citations: item.citations.map((citation) => ({
      ...citation,
      quote: [
        'released an enterprise collaboration feature',
        'channel partner program',
        'joint delivery agreement',
        'audit log'
      ][index]
    }))
  })),
  questions: sampleData.questions.map((item, index) => ({
    ...item,
    question: [
      'Which partners are you looking for to integrate the new collaboration feature?',
      'How would revenue and responsibility be shared in joint selling as the channel program expands?',
      'What are the limits of the enterprise audit log feature, and can third parties export it?'
    ][index],
    reason: [
      'This connects directly to the recent release and tests whether our integration would be useful.',
      'The channel expansion and delivery agreement make the partnership model worth clarifying.',
      'The documentation update points to a compliance need that should be checked early.'
    ][index]
  })),
  sources: sampleData.sources.map((item, index) => ({
    ...item,
    title: [
      'Example Company releases collaboration feature (fictional)',
      'Example Company expands channel program (fictional)',
      'Example Company signs joint delivery agreement (fictional)',
      'Example Company updates developer docs (fictional)'
    ][index],
    query: [
      'Example Company enterprise collaboration launch',
      'Example Company channel partner program',
      'Example Company joint delivery agreement',
      'Example Company developer docs audit log'
    ][index],
    snippet: [
      'On November 5, Example Company released an enterprise collaboration feature supporting shared workspaces across organizations.',
      'Industry outlets reported that Example Company is expanding its channel partner program.',
      'On October 21, Example Company announced a joint delivery agreement with a regional service provider.',
      'Example Company updated its developer docs with guidance on enterprise audit logs.'
    ][index]
  }))
}

export const partialDataEn: BriefingResult = {
  ...partialData,
  entity: 'Example Materials Co.',
  meeting_goal: 'Evaluate a supply-chain partnership',
  language: 'en',
  headline: 'Example Materials Co. | 30-day meeting brief',
  developments: [{
    ...partialData.developments[0],
    fact: 'Example Materials Co. announced plans for a new-material pilot production line.',
    meeting_implication: 'A pilot line may mean capacity is still being validated, making delivery timing a useful discussion point.',
    citations: [{ source_id: 'S1', quote: 'pilot production line plan' }]
  }],
  questions: [{
    ...partialData.questions[0],
    question: 'When could the pilot line support supply at scale?',
    reason: 'The public announcement names a pilot line but gives no capacity or timeline.'
  }],
  gaps: [
    'No recent reporting on management or organizational changes was found.',
    'Three search results lacked parseable publication dates and were excluded.',
    'A draft claim about a new customer contract lacked a matching article quote and was rejected.'
  ],
  sources: [{
    ...partialData.sources[0],
    title: 'Example Materials Co. pilot line plan (fictional)',
    query: 'Example Materials Co. pilot line capacity',
    snippet: 'Example Materials Co. announced plans for a new-material pilot production line.'
  }]
}

export const insufficientDataEn: BriefingResult = {
  ...insufficientData,
  entity: 'Example Private Company',
  meeting_goal: 'Initial business introduction',
  language: 'en',
  headline: 'Example Private Company | 30-day meeting brief',
  gaps: [
    'No dated article with a matching quote was found in the 30-day window.',
    'Seven of twelve search results had no publication date and were excluded.',
    'Two results were published after the meeting time and were excluded.'
  ],
  trace: [{ stage: 'assess', detail: 'Insufficient dated evidence in search results', queries: [] }]
}
