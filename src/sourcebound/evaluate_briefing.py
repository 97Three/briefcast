"""Collect live briefing outputs for manual source and relevance review."""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .briefing import build_briefing_graph, initial_briefing_state, public_briefing_result
from .providers import DeepSeekModel, TavilyWebSearch
from .schemas import BriefingRequest


async def evaluate(cases_path: Path, output_path: Path) -> None:
    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    if not isinstance(cases, list) or not cases:
        raise ValueError("The briefing cases file must contain a nonempty JSON array")
    graph = build_briefing_graph(DeepSeekModel(), TavilyWebSearch())
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as output:
        for case in cases:
            if not isinstance(case, dict):
                raise ValueError("Each briefing case must be a JSON object")
            case_id = str(case["id"])
            offset = str(case.get("timezone_offset", "+08:00"))
            match = re.fullmatch(r"([+-])(\d{2}):(\d{2})", offset)
            if not match or int(match[2]) > 14 or int(match[3]) > 59:
                raise ValueError(f"Invalid timezone_offset for {case_id}: {offset}")
            minutes = (int(match[2]) * 60 + int(match[3])) * (1 if match[1] == "+" else -1)
            tz = timezone(timedelta(minutes=minutes))
            meeting_at = case.get("meeting_at") or (
                datetime.now(tz) + timedelta(days=int(case.get("meeting_days_ahead", 2)))
            ).isoformat()
            request = BriefingRequest.model_validate({
                key: value for key, value in case.items()
                if key in BriefingRequest.model_fields
            } | {"meeting_at": meeting_at})
            started = time.perf_counter()
            record: dict = {"id": case_id, "request": request.model_dump(mode="json")}
            try:
                result = public_briefing_result(await graph.ainvoke(initial_briefing_state(request)))
                record["result"] = result.model_dump(mode="json")
                summary = f"{case_id}: {result.status}, {len(result.developments)} verified developments, {len(result.questions)} questions"
            except Exception as exc:
                record["error"] = type(exc).__name__
                summary = f"{case_id}: failed ({type(exc).__name__})"
            record["elapsed_seconds"] = round(time.perf_counter() - started, 2)
            output.write(json.dumps(record, ensure_ascii=False) + "\n")
            output.flush()
            print(f"{summary}, {record['elapsed_seconds']}s")
    print(f"Saved review data to {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate live meeting briefings")
    parser.add_argument("--cases", type=Path, default=Path("docs/briefing-eval-cases.json"))
    parser.add_argument("--output", type=Path, default=Path("runs/briefing-evaluation.jsonl"))
    args = parser.parse_args()
    asyncio.run(evaluate(args.cases, args.output))


if __name__ == "__main__":
    main()
