import asyncio
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi.testclient import TestClient

from sourcebound.api import create_app
from sourcebound.briefing import build_briefing_graph, initial_briefing_state, public_briefing_result
from sourcebound.schemas import BriefingRequest, BriefingResult


MEETING = datetime(2026, 11, 15, 10, tzinfo=timezone.utc)
NOW = datetime(2026, 11, 10, 10, tzinfo=timezone.utc)


class BriefingModel:
    def __init__(self, *, invalid_quote=False):
        self.invalid_quote = invalid_quote

    async def json_response(self, system, user):
        if system.startswith("You plan"):
            return {"queries": ["Acme launch news"]}
        if system.startswith("Write JSON {\"questions\""):
            return {"questions": [{"question": "How does the launch affect your partner plans?",
                                   "reason": "The launch may create a collaboration opportunity.",
                                   "development_ids": ["D1"]}]}
        if system.startswith("Write JSON"):
            return {"developments": [{
                "fact": "Acme launched a new product.",
                "meeting_implication": "This may open a partnership discussion.",
                "citations": [{"source_id": "S1", "quote": "invented" if self.invalid_quote else "launched a new product"}],
            }]}
        if system.startswith("You are a strict"):
            return {"verdicts": [{"index": 0, "supported": True, "reason": "direct quote"}]}
        raise AssertionError(system)


class BriefingSearch:
    def __init__(self):
        self.calls = []

    async def search_recent(self, query, start_date, end_date):
        self.calls.append((query, start_date, end_date))
        return [
            {"url": "https://example.org/new", "title": "Launch", "content": "Acme launched a new product.",
             "raw_content": "Acme launched a new product.",
             "published_date": "2026-11-08"},
            {"url": "https://example.org/old", "title": "Old", "content": "Old launch",
             "raw_content": "Old launch",
             "published_date": "2026-09-01"},
            {"url": "https://example.org/undated", "title": "Undated", "content": "Unknown date"},
            {"url": "https://example.org/future", "title": "Future", "content": "Future announcement",
             "raw_content": "Future announcement",
             "published_date": "2026-11-13"},
        ]


def run(model=None, search=None):
    request = BriefingRequest(entity="Acme", meeting_at=MEETING, meeting_goal="Partnership")
    graph = build_briefing_graph(model or BriefingModel(), search or BriefingSearch())
    state = asyncio.run(graph.ainvoke(initial_briefing_state(request, now=NOW)))
    return public_briefing_result(state)


def test_briefing_enforces_meeting_window_and_citations():
    search = BriefingSearch()
    result = run(search=search)
    assert search.calls[0][1:] == ("2026-10-16", "2026-11-10")
    assert [source.id for source in result.sources] == ["S1"]
    assert len(result.developments) == 1
    assert result.developments[0].citations[0].source_id == "S1"
    assert result.questions[0].development_ids == ["D1"]
    assert result.status == "completed"


def test_unverified_fact_cannot_generate_meeting_question():
    result = run(model=BriefingModel(invalid_quote=True))
    assert result.developments == []
    assert result.questions == []
    assert result.status == "insufficient_evidence"


def test_meeting_time_requires_timezone():
    client = TestClient(create_app(BriefingModel(), BriefingSearch()))
    response = client.post("/api/briefing", json={"entity": "Acme", "meeting_at": "2026-11-15T10:00:00"})
    assert response.status_code == 422


def test_briefing_api_and_progress_stream():
    class CurrentSearch:
        async def search_recent(self, query, start_date, end_date):
            return [{"url": "https://example.org/current", "title": "Launch",
                     "content": "Acme launched a new product.",
                     "raw_content": "Acme launched a new product.",
                     "published_date": datetime.now(timezone.utc).date().isoformat()}]

    client = TestClient(create_app(BriefingModel(), CurrentSearch()))
    request = {"entity": "Acme",
               "meeting_at": (datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
               "meeting_goal": "Partnership"}
    response = client.post("/api/briefing", json=request)
    assert response.status_code == 200
    assert response.json()["developments"][0]["citations"][0]["source_id"] == "S1"
    with client.stream("POST", "/api/briefing/stream", json=request) as streamed:
        streamed.read()
        assert "event: progress" in streamed.text
        assert "event: result" in streamed.text


def test_dated_search_error_is_visible():
    class BrokenSearch:
        async def search_recent(self, query, start_date, end_date):
            raise RuntimeError("secret")

    request = BriefingRequest(entity="Acme", meeting_at=MEETING)
    graph = build_briefing_graph(BriefingModel(), BrokenSearch())
    try:
        asyncio.run(graph.ainvoke(initial_briefing_state(request, now=NOW)))
    except RuntimeError as exc:
        assert str(exc) == "All Tavily searches failed"
    else:
        raise AssertionError("expected search failure")


def test_partial_query_timeout_still_produces_briefing(monkeypatch):
    monkeypatch.setattr("sourcebound.briefing.SEARCH_TIMEOUT_SECONDS", 0.01)
    monkeypatch.setattr("sourcebound.briefing.SEARCH_RETRY_TIMEOUT_SECONDS", 0.01)
    monkeypatch.setattr("sourcebound.briefing.SEARCH_RETRY_BACKOFF_SECONDS", 0)

    class PartlySlowSearch:
        async def search_recent(self, query, start_date, end_date):
            if "site:" not in query:
                await asyncio.sleep(0.05)
                return []
            return [{"url": "https://example.org/current", "title": "Launch",
                     "content": "Acme launched a new product.",
                     "raw_content": "Acme launched a new product.",
                     "published_date": "2026-11-08"}]

    request = BriefingRequest(entity="Acme", meeting_at=MEETING,
                              official_domain="example.org")
    graph = build_briefing_graph(BriefingModel(), PartlySlowSearch())
    state = asyncio.run(graph.ainvoke(initial_briefing_state(request, now=NOW)))
    result = public_briefing_result(state)
    assert result.developments[0].citations[0].source_id == "S1"
    assert result.status in {"completed", "partial"}
    assert any("failed queries" in step.detail for step in result.trace if step.stage == "search")


def test_transient_timeout_retries_once_then_succeeds(monkeypatch):
    monkeypatch.setattr("sourcebound.briefing.SEARCH_RETRY_BACKOFF_SECONDS", 0)

    class FlakySearch:
        def __init__(self):
            self.calls = 0

        async def search_recent(self, query, start_date, end_date):
            self.calls += 1
            if self.calls == 1:
                raise asyncio.TimeoutError()
            return [{"url": f"https://example.org/current-{index}", "title": "Launch",
                     "content": "Acme launched a new product.",
                     "raw_content": "Acme launched a new product.",
                     "published_date": "2026-11-08"} for index in range(3)]

    search = FlakySearch()
    result = run(search=search)
    assert search.calls == 2
    assert result.developments[0].citations[0].source_id == "S1"


def test_briefing_errors_log_stack_without_exposing_key(monkeypatch, caplog):
    fake_key = "fake-secret-key-for-test"
    monkeypatch.setenv("TAVILY_API_KEY", fake_key)

    class BrokenSearch:
        async def search_recent(self, query, start_date, end_date):
            raise RuntimeError(f"provider rejected {fake_key}")

    client = TestClient(create_app(BriefingModel(), BrokenSearch()))
    request = {"entity": "Acme", "meeting_at":
               (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()}
    with caplog.at_level(logging.ERROR, logger="sourcebound.api"):
        with client.stream("POST", "/api/briefing/stream", json=request) as response:
            response.read()
            assert "event: error" in response.text
            assert fake_key not in response.text
        plain = client.post("/api/briefing", json=request)
    assert plain.status_code == 502
    assert fake_key not in plain.text
    records = [record.message for record in caplog.records if record.name == "sourcebound.api"]
    assert len(records) >= 2
    assert all("stage=search" in message and "Traceback frames:" in message
               and "briefing.py:" in message for message in records)
    assert all(fake_key not in message for message in records)


def test_briefing_sample_matches_public_schema():
    sample = (Path(__file__).resolve().parents[1] / "docs/briefing-sample.json").read_text(encoding="utf-8")
    result = BriefingResult.model_validate_json(sample)
    assert result.developments[0].citations[0].source_id == result.sources[0].id
    assert result.questions[0].development_ids == [result.developments[0].id]


def test_official_domain_normalization_and_source_tagging():
    request = BriefingRequest(entity="Acme", meeting_at=MEETING,
                              official_domain="https://www.example.org/")
    assert request.official_domain == "example.org"
    search = BriefingSearch()
    graph = build_briefing_graph(BriefingModel(), search)
    result = public_briefing_result(asyncio.run(graph.ainvoke(initial_briefing_state(request, now=NOW))))
    assert any("site:example.org" in query for query, _, _ in search.calls)
    assert result.sources[0].source_type == "official"
    assert result.official_domain == "example.org"


def test_explicit_event_date_is_kept_with_its_quote():
    class DateModel(BriefingModel):
        async def json_response(self, system, user):
            if system.startswith("Write JSON") and not system.startswith('Write JSON {"questions"'):
                return {"developments": [{"fact": "Acme launched a new product on November 5.",
                                          "meeting_implication": "This may affect partner plans.",
                                          "event_date": "2026-11-05",
                                          "event_date_quote": {"source_id": "S1", "quote": "November 5, 2026"},
                                          "citations": [{"source_id": "S1", "quote": "launched a new product"}]}]}
            return await super().json_response(system, user)

    class DateSearch:
        async def search_recent(self, query, start_date, end_date):
            return [{"url": "https://example.org/dated", "title": "Launch",
                     "content": "Acme launched a new product on November 5, 2026.",
                     "raw_content": "Acme launched a new product on November 5, 2026.",
                     "published_date": "2026-11-08"}]

    result = run(model=DateModel(), search=DateSearch())
    assert result.developments[0].date == "2026-11-05"
    assert result.developments[0].date_basis == "explicit_event_date"
    assert result.developments[0].date_evidence.quote == "November 5, 2026"


def test_recent_article_about_old_event_is_rejected():
    class OldEventModel(BriefingModel):
        async def json_response(self, system, user):
            if system.startswith("Write JSON") and not system.startswith('Write JSON {"questions"'):
                return {"developments": [{"fact": "Acme launched a new product in September.",
                                          "meeting_implication": "This may affect partner plans.",
                                          "event_date": "2026-09-01",
                                          "event_date_quote": {"source_id": "S1", "quote": "September 1, 2026"},
                                          "citations": [{"source_id": "S1", "quote": "launched a new product"}]}]}
            return await super().json_response(system, user)

    class OldEventSearch:
        async def search_recent(self, query, start_date, end_date):
            return [{"url": "https://example.org/recap", "title": "Recap",
                     "content": "Acme launched a new product on September 1, 2026.",
                     "raw_content": "Acme launched a new product on September 1, 2026.",
                     "published_date": "2026-11-08"}]

    result = run(model=OldEventModel(), search=OldEventSearch())
    assert result.developments == []
    assert result.status == "insufficient_evidence"
    assert result.research_stats["drafts_rejected"] == 1


def test_duplicate_developments_are_merged():
    class DuplicateModel(BriefingModel):
        async def json_response(self, system, user):
            if system.startswith("Write JSON") and not system.startswith('Write JSON {"questions"'):
                item = {"fact": "Acme launched a new product.",
                        "meeting_implication": "This may affect partner plans.",
                        "citations": [{"source_id": "S1", "quote": "launched a new product"}]}
                return {"developments": [item, dict(item)]}
            if system.startswith("You are a strict"):
                return {"verdicts": [{"index": 0, "supported": True},
                                     {"index": 1, "supported": True, "duplicate_of": 0}]}
            return await super().json_response(system, user)

    result = run(model=DuplicateModel())
    assert len(result.developments) == 1
    assert result.research_stats["duplicate_developments"] == 1


def test_person_queries_include_organization_and_repeated_citations_collapse():
    class PersonModel(BriefingModel):
        async def json_response(self, system, user):
            if system.startswith("You plan"):
                return {"queries": ["Jane Doe announcement"]}
            if system.startswith("Write JSON") and not system.startswith('Write JSON {"questions"'):
                return {"developments": [{
                    "fact": "Jane Doe launched a new product.",
                    "meeting_implication": "This may affect partner plans.",
                    "citations": [{"source_id": "S1", "quote": "launched a new product"},
                                  {"source_id": "S1", "quote": "new product"}],
                }]}
            return await super().json_response(system, user)

    class PersonSearch:
        def __init__(self):
            self.queries = []

        async def search_recent(self, query, start_date, end_date):
            self.queries.append(query)
            return [{"url": "https://example.org/person", "title": "Launch",
                     "content": "Jane Doe at Acme launched a new product.",
                     "raw_content": "Jane Doe at Acme launched a new product.",
                     "published_date": "2026-11-08"}]

    search = PersonSearch()
    request = BriefingRequest(entity="Jane Doe", entity_type="person", organization="Acme", meeting_at=MEETING)
    graph = build_briefing_graph(PersonModel(), search)
    result = public_briefing_result(asyncio.run(graph.ainvoke(initial_briefing_state(request, now=NOW))))
    assert all("Acme" in query for query in search.queries)
    assert len(result.developments[0].citations) == 1
    assert result.entity_type == "person"


def test_blank_entity_and_non_homepage_domain_are_rejected():
    client = TestClient(create_app(BriefingModel(), BriefingSearch()))
    for fields in ({"entity": "  "}, {"entity": "Acme", "official_domain": "https://example.org/article"}):
        response = client.post("/api/briefing", json={**fields, "meeting_at": MEETING.isoformat()})
        assert response.status_code == 422


def test_search_summary_alone_cannot_support_a_fact():
    class MisleadingSearch:
        async def search_recent(self, query, start_date, end_date):
            return [{"url": "https://example.org/article", "title": "Article",
                     "content": "Acme launched a new product.",
                     "raw_content": "Acme published a routine update with no product launch.",
                     "published_date": "2026-11-08"}]

    result = run(search=MisleadingSearch())
    assert result.sources[0].snippet == "Acme launched a new product."
    assert result.developments == []
    assert result.research_stats["drafts_rejected"] == 1


def test_result_without_full_text_is_excluded():
    class SummaryOnlySearch:
        async def search_recent(self, query, start_date, end_date):
            return [{"url": "https://example.org/article", "title": "Article",
                     "content": "Acme launched a new product.", "published_date": "2026-11-08"}]

    result = run(search=SummaryOnlySearch())
    assert result.sources == []
    assert result.developments == []
    assert result.research_stats["excluded_no_full_text"] >= 1
