# Backend acceptance plan

The offline tests check the graph, API contract, citation IDs and exact quote matching, bounded search, gaps, and error visibility. Live acceptance requires DeepSeek and Tavily keys in the local `.env` file.

## Live checks before the demo

1. Run `python -m sourcebound.check`. Verify one real DeepSeek inference and one real Tavily search succeed.
2. Run `python -m sourcebound.evaluate` for the six prepared questions in `docs/eval-questions.json`. Add at least two questions on a topic not used during development, including an older article conflicting with current official documentation. Results are saved to `runs/evaluation.jsonl` for manual review.
3. For every output, open each cited URL and manually judge whether the cited passage supports the claim. Record unsupported claims and inaccessible links.
4. Measure completion time and search/model usage. Try a second available DeepSeek model if JSON adherence or evidence judgment is weak.
5. Re-run the three strongest demo questions immediately before recording. Preserve their question, answer, cited URLs, and outcome in a private review sheet. The recorded demo must still show a real live run.

## Acceptance gates

- Every cited source ID exists in the same result.
- Every quoted passage is present in captured search content.
- The answer includes only claims marked `supported`; `disputed` and `insufficient` claims remain visible with their status.
- Source conflicts and missing evidence do not become certain conclusions.
- Invalid configuration, empty search, and provider failure are visible to the caller.
- The frontend can show progress, final result, and errors from the documented API without parsing model prose.

Exact quote checks are deterministic. Whether the passage truly entails the claim is judged by a second model call and must be manually audited on representative live cases.
