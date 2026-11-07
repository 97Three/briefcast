import asyncio
from types import SimpleNamespace

from sourcebound.providers import DeepSeekModel, TavilyWebSearch


class FakeCompletions:
    def __init__(self, outputs):
        self.outputs = iter(outputs)
        self.calls = []

    async def create(self, **kwargs):
        self.calls.append(kwargs)
        return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=next(self.outputs)))])


def test_deepseek_requests_json_and_retries_bad_model_output():
    completions = FakeCompletions(["not json", '{"ok": true}'])
    model = object.__new__(DeepSeekModel)
    model.model = "deepseek-flash"
    model.client = SimpleNamespace(chat=SimpleNamespace(completions=completions))
    result = asyncio.run(model.json_response("Respond with a verdict", "Question"))
    assert result == {"ok": True}
    assert len(completions.calls) == 2
    assert completions.calls[0]["response_format"] == {"type": "json_object"}
    assert "invalid JSON" in completions.calls[1]["messages"][-1]["content"]


def test_deepseek_falls_back_to_text_mode_after_empty_json_responses():
    completions = FakeCompletions(["   ", "", '{"ok": true}'])
    model = object.__new__(DeepSeekModel)
    model.model = "deepseek-flash"
    model.client = SimpleNamespace(chat=SimpleNamespace(completions=completions))
    assert asyncio.run(model.json_response("Return JSON", "Question")) == {"ok": True}
    assert len(completions.calls) == 3
    assert "response_format" not in completions.calls[2]


def test_tavily_search_requests_full_content():
    class FakeClient:
        async def search(self, **kwargs):
            assert kwargs["search_depth"] == "advanced"
            assert kwargs["include_raw_content"] is True
            return {"results": [{"url": "https://example.org", "content": "evidence"}]}

    provider = object.__new__(TavilyWebSearch)
    provider.client = FakeClient()
    assert len(asyncio.run(provider.search("research question"))) == 1


def test_tavily_recent_search_passes_date_window():
    class FakeClient:
        async def search(self, **kwargs):
            assert kwargs["topic"] == "news"
            assert kwargs["start_date"] == "2026-10-13"
            assert kwargs["end_date"] == "2026-11-10"
            return {"results": []}

    provider = object.__new__(TavilyWebSearch)
    provider.client = FakeClient()
    assert asyncio.run(provider.search_recent("Acme launch", "2026-10-13", "2026-11-10")) == []
