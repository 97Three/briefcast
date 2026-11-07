from __future__ import annotations

import json
import os
import re
from typing import Any, Protocol

from dotenv import load_dotenv
from openai import AsyncOpenAI, BadRequestError
from tavily import AsyncTavilyClient

load_dotenv()


class ModelProvider(Protocol):
    async def json_response(self, system: str, user: str) -> dict[str, Any]: ...


class SearchProvider(Protocol):
    async def search(self, query: str) -> list[dict[str, Any]]: ...


DEFAULT_MODEL = "deepseek-flash"
DEFAULT_DIRECT_BASE_URL = "https://api.deepseek.com"


class DeepSeekModel:
    def __init__(self) -> None:
        key = os.getenv("DEEPSEEK_API_KEY")
        model = os.getenv("DEEPSEEK_MODEL", DEFAULT_MODEL)
        if not key or not model:
            raise RuntimeError("Set DEEPSEEK_API_KEY in .env")
        self.model = model
        self.client = AsyncOpenAI(
            api_key=key,
            base_url=(os.getenv("DEEPSEEK_BASE_URL") or DEFAULT_DIRECT_BASE_URL),
            timeout=40,
            max_retries=1,
        )

    async def json_response(self, system: str, user: str) -> dict[str, Any]:
        messages = [
            {"role": "system", "content": system + "\nReturn a JSON object only."},
            {"role": "user", "content": user},
        ]
        json_mode = True
        for attempt in range(3):
            options = {"response_format": {"type": "json_object"}} if json_mode else {}
            try:
                response = await self.client.chat.completions.create(
                    model=self.model, temperature=0, max_tokens=8192,
                    messages=messages, **options
                )
            except BadRequestError as exc:
                if json_mode and "response_format" in str(exc).lower():
                    json_mode = False
                    continue
                raise
            content = response.choices[0].message.content or ""
            content = re.sub(r"^```(?:json)?\s*|\s*```$", "", content.strip(), flags=re.I)
            try:
                parsed = json.loads(content)
            except json.JSONDecodeError:
                if attempt < 2:
                    if attempt == 1:
                        json_mode = False
                    messages.append({"role": "user", "content": "The previous output was empty or invalid JSON. Return one compact valid JSON object only, without a code fence or explanation."})
                    continue
                raise ValueError("Model did not return valid JSON")
            if not isinstance(parsed, dict):
                raise ValueError("Model JSON must be an object")
            return parsed
        raise ValueError("Model did not return valid JSON")


class TavilyWebSearch:
    def __init__(self) -> None:
        key = os.getenv("TAVILY_API_KEY")
        if not key:
            raise RuntimeError("Set TAVILY_API_KEY in .env")
        self.client = AsyncTavilyClient(api_key=key)

    async def search(self, query: str) -> list[dict[str, Any]]:
        response = await self.client.search(
            query=query,
            search_depth="advanced",
            max_results=5,
            include_raw_content=True,
        )
        return response.get("results", [])

    async def search_recent(self, query: str, start_date: str, end_date: str) -> list[dict[str, Any]]:
        response = await self.client.search(
            query=query,
            topic="news",
            start_date=start_date,
            end_date=end_date,
            search_depth="advanced",
            max_results=6,
            include_raw_content=True,
        )
        return response.get("results", [])
