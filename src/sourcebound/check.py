"""Make one real call to each required provider without printing credentials."""

from __future__ import annotations

import asyncio
import os

from .providers import DeepSeekModel, TavilyWebSearch


async def main() -> None:
    missing = [name for name in ("DEEPSEEK_API_KEY", "TAVILY_API_KEY") if not os.getenv(name)]
    if missing:
        raise SystemExit("Missing settings in .env: " + ", ".join(missing))
    model = DeepSeekModel()
    search = TavilyWebSearch()
    result = await model.json_response(
        'Return exactly {"ok":true}.', 'Connectivity check.'
    )
    if result.get("ok") is not True:
        raise RuntimeError("DeepSeek returned an unexpected response")
    print(f"DeepSeek inference OK: {model.model}")
    results = await search.search("DeepSeek API official documentation")
    if not results:
        raise RuntimeError("Tavily returned no results")
    print(f"Tavily search OK: {len(results)} results")


if __name__ == "__main__":
    asyncio.run(main())
