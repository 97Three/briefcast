"""Run a fixed set of live questions and save results for human evidence review."""

from __future__ import annotations

import argparse
import asyncio
import json
import time
from datetime import datetime, timezone
from pathlib import Path

from .graph import build_graph, initial_state, public_result
from .providers import DeepSeekModel, TavilyWebSearch


async def evaluate(input_path: Path, output_path: Path) -> None:
    cases = json.loads(input_path.read_text(encoding="utf-8"))
    if not isinstance(cases, list) or not cases:
        raise ValueError("The question file must contain a nonempty JSON array")
    graph = build_graph(DeepSeekModel(), TavilyWebSearch())
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as output:
        for case in cases:
            case_id = str(case["id"])
            question = str(case["question"])
            started = time.perf_counter()
            record: dict = {"id": case_id, "question": question, "run_at": datetime.now(timezone.utc).isoformat()}
            try:
                result = public_result(await graph.ainvoke(initial_state(question)))
                record["result"] = result.model_dump(mode="json")
                statuses = [claim.status.value for claim in result.claims]
                record["counts"] = {
                    "sources": len(result.sources),
                    "supported": statuses.count("supported"),
                    "disputed": statuses.count("disputed"),
                    "insufficient": statuses.count("insufficient"),
                }
                summary = f"{case_id}: {result.status}, {len(result.sources)} sources, {record['counts']['supported']} supported claims"
            except Exception as exc:
                record["error"] = type(exc).__name__
                summary = f"{case_id}: failed ({type(exc).__name__})"
            record["elapsed_seconds"] = round(time.perf_counter() - started, 2)
            output.write(json.dumps(record, ensure_ascii=False) + "\n")
            output.flush()
            print(f"{summary}, {record['elapsed_seconds']}s")
    print(f"Saved review data to {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate live research questions")
    parser.add_argument("--questions", type=Path, default=Path("docs/eval-questions.json"))
    parser.add_argument("--output", type=Path, default=Path("runs/evaluation.jsonl"))
    args = parser.parse_args()
    asyncio.run(evaluate(args.questions, args.output))


if __name__ == "__main__":
    main()
