from __future__ import annotations

import asyncio
import sys

from .graph import build_graph, initial_state, public_result
from .providers import DeepSeekModel, TavilyWebSearch


async def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit('Usage: python -m sourcebound "research question"')
    graph = build_graph(DeepSeekModel(), TavilyWebSearch())
    result = public_result(await graph.ainvoke(initial_state(" ".join(sys.argv[1:]))))
    print(result.model_dump_json(indent=2))


if __name__ == "__main__":
    asyncio.run(main())
