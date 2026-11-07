import asyncio

import pytest

from sourcebound.graph import build_graph, initial_state, public_result


class FakeModel:
    def __init__(self, *, invalid_citation=False, disputed=False, always_gap=False):
        self.invalid_citation = invalid_citation
        self.disputed = disputed
        self.always_gap = always_gap

    async def json_response(self, system, user):
        if system.startswith("You plan"):
            return {"queries": ["feature official docs"], "challenge_query": "feature limitations"}
        if system.startswith("Assess"):
            if self.always_gap:
                return {"enough": False, "gaps": ["current limitations remain unclear"], "followup_queries": ["feature latest changes"]}
            if '"S2"' not in user:
                return {"enough": False, "gaps": ["latest changes"], "followup_queries": ["feature latest changes"]}
            return {"enough": True, "gaps": [], "followup_queries": []}
        if system.startswith("Write"):
            return {"claims": [{"text": "The product supports exports.", "citations": [{
                "source_id": "S99" if self.invalid_citation else "S1",
                "quote": "supports exports" if not self.invalid_citation else "invented quote",
            }]}], "gaps": []}
        if system.startswith("You are a strict"):
            return {"verdicts": [{"index": 0, "status": "disputed" if self.disputed else "supported", "reason": "Direct quote"}]}
        raise AssertionError(system)


class FakeSearch:
    async def search(self, query):
        if query == "feature latest changes":
            return [{"url": "https://example.org/changes", "title": "Changes", "content": "Latest update confirms exports."}]
        return [{"url": "https://example.org/docs?utm_source=test", "title": "Docs", "content": "The product supports exports."}]


def run(model=None, search=None):
    graph = build_graph(model or FakeModel(), search or FakeSearch())
    return public_result(asyncio.run(graph.ainvoke(initial_state("Does the product support exports?"))))


def test_full_research_loop_and_evidence():
    result = run()
    assert result.search_rounds == 2
    assert len(result.sources) == 2
    assert result.status == "completed"
    assert result.claims[0].status == "supported"
    assert result.claims[0].citations[0].source_id == "S1"
    assert "[S1]" in result.answer
    assert [x.stage for x in result.trace] == ["plan", "search", "assess", "search", "assess", "draft", "verify"]


def test_invented_citation_cannot_be_accepted():
    result = run(FakeModel(invalid_citation=True))
    assert result.status == "insufficient_evidence"
    assert result.claims[0].citations == []
    assert "[S99]" not in result.answer


def test_disputed_claim_is_not_presented_as_fact():
    result = run(FakeModel(disputed=True))
    assert result.status == "insufficient_evidence"
    assert result.claims[0].status == "disputed"
    assert "暂不能给出确定结论" in result.answer


def test_supported_claim_with_unresolved_gap_is_partial():
    result = run(FakeModel(always_gap=True))
    assert result.search_rounds == 2
    assert result.status == "partial"
    assert result.gaps == ["current limitations remain unclear"]
    assert "仍有未查清的问题" in result.answer


def test_uncovered_question_keeps_a_gap_even_when_model_omits_one():
    class IncompleteModel(FakeModel):
        async def json_response(self, system, user):
            if system.startswith("Assess"):
                return {"enough": False, "gaps": [], "followup_queries": []}
            return await super().json_response(system, user)

    result = run(IncompleteModel())
    assert result.status == "partial"
    assert result.gaps


def test_mixed_supported_and_unverified_claims_are_partial():
    class MixedModel(FakeModel):
        async def json_response(self, system, user):
            if system.startswith("Write"):
                return {"claims": [
                    {"text": "The product supports exports.", "citations": [{"source_id": "S1", "quote": "supports exports"}]},
                    {"text": "The product is free.", "citations": [{"source_id": "S1", "quote": "free forever"}]},
                ], "gaps": []}
            return await super().json_response(system, user)

    result = run(MixedModel())
    assert result.status == "partial"
    assert [claim.status for claim in result.claims] == ["supported", "insufficient"]
    assert "The product is free" not in result.answer


def test_first_round_keeps_counterevidence_search_results():
    class ManyResults:
        async def search(self, query):
            return [{"url": f"https://example.org/{query.replace(' ', '-')}/{i}", "title": query, "content": "The product supports exports."} for i in range(5)]

    result = run(search=ManyResults())
    assert result.search_rounds == 1
    assert sum(source.query == "feature limitations" for source in result.sources) == 3


class EmptySearch:
    async def search(self, query):
        return []


def test_empty_search_reports_insufficient_evidence():
    result = run(search=EmptySearch())
    assert result.search_rounds == 2
    assert result.sources == []
    assert result.status == "insufficient_evidence"
    assert result.claims == []


def test_empty_first_round_recovers_with_focused_followup():
    class RecoverySearch:
        async def search(self, query):
            if "official documentation" in query:
                return [{"url": "https://example.org/docs", "title": "Docs", "content": "The product supports exports."}]
            return []

    result = run(search=RecoverySearch())
    assert result.search_rounds == 2
    assert len(result.sources) == 1
    assert result.claims[0].status == "supported"


class BrokenSearch:
    async def search(self, query):
        raise RuntimeError("401 secret")


def test_total_search_failure_is_visible():
    graph = build_graph(FakeModel(), BrokenSearch())
    with pytest.raises(RuntimeError, match="All Tavily searches failed"):
        asyncio.run(graph.ainvoke(initial_state("Does the product support exports?")))
