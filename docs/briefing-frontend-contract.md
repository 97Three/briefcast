# Meeting briefing frontend contract, version 0.2

The frontend calls `POST /api/briefing/stream` for the main experience. `POST /api/briefing` returns the same final JSON without progress events. Both endpoints use the same backend graph.

## Input

```json
{
  "entity": "Microsoft",
  "entity_type": "company",
  "official_domain": "microsoft.com",
  "attendee": "对方产品负责人",
  "meeting_at": "2026-11-12T15:00:00+08:00",
  "meeting_goal": "讨论企业 AI 产品合作",
  "language": "zh"
}
```

`entity` is a company or person. `entity_type` is `company` (default) or `person`. For a person, `organization` helps distinguish people with the same name. `official_domain` accepts a domain or homepage URL, for example `microsoft.com` or `https://www.microsoft.com/`; it is normalized to the hostname. `attendee` is optional context. The frontend should show these as advanced fields rather than making every user fill them.

`meeting_at` must include a timezone offset; otherwise the API returns HTTP 422. `meeting_goal` is optional and defaults to a general business partnership conversation. `language` is `zh` (default) or `en`; source quotes remain in their original language. The backend computes `window_start = meeting_at - 30 days` and `window_end = min(meeting_at, current time)`.

## Output

The response has the input identity fields, `meeting_at`, `meeting_goal`, `language`, `window_start`, `window_end`, `generated_at`, `headline`, `developments`, `questions`, `gaps`, `sources`, `trace`, `research_stats`, and `status`.

- `developments`: at most four verified items. Each has `id`, `date`, `date_basis`, `date_evidence`, `fact`, `meeting_implication`, and `citations`. `date_basis=explicit_event_date` means `date` is supported by the exact `date_evidence` quote. `date_basis=source_publication` means `date` is the source publication date used as a proxy because the event day was not explicit. Label the latter as “来源发布日期” in the UI. A citation contains `source_id` and an exact `quote`.
- `questions`: at most three items. Each has `question`, `reason`, and `development_ids` pointing to accepted developments.
- `sources`: dated Tavily results with `id`, `title`, `url`, `query`, `snippet`, `published_at`, `retrieved_at`, and `source_type`. `snippet` is a search summary and must not be displayed as an original quote. Citation `quote` values are checked against retrieved article text. Results without article text are excluded. `source_type=official` only when the URL matches the user supplied `official_domain`; without that input it is `unclassified`. Do not imply an unclassified source is unreliable. No full page text is sent to the browser.
- `research_stats`: integer counts for search results seen, excluded results, rejected drafts, merged duplicate developments, search rounds, reviewed sources, and verified developments. These are process counts, not an accuracy score.
- `gaps`: research limitations or facts rejected by verification.
- `status`: `completed`, `partial`, or `insufficient_evidence`. Show the empty state and gaps when there are no verified developments.

`meeting_implication` is an inference for discussion, whereas `fact` is a verified development. The frontend should label these separately. Show the date basis, publication date, and source link beside every factual development; do not display an uncited fact as verified. Questions can link to the related developments using `development_ids`; do not show the raw D1/D2 IDs in question copy.

## Progress stream

The streamed endpoint accepts a POST body. Use `fetch()` to parse the SSE response; native `EventSource` only supports GET. Events are `progress`, then `result` or `error`. Progress stages are `plan`, `search`, `assess`, `draft`, `verify`, and `compose`; each event has `stage`, `detail`, `queries`, `search_rounds`, and `source_count`. The frontend should preserve the final `status` even if a progress event was successful.

## Errors and demo data

- HTTP 422: invalid input, including missing timezone.
- HTTP 503: missing DeepSeek or Tavily key.
- HTTP 502 or SSE `error`: provider or workflow failure. Provider secrets are not returned.

Use [the synthetic briefing sample](briefing-sample.json) to build the frontend before running live research. Its company, sources, and results are fictional and must be labeled as sample content.
