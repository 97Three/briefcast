import json
from pathlib import Path

from fastapi.testclient import TestClient

from sourcebound.api import create_app
from sourcebound.schemas import ResearchResult
from test_graph import BrokenSearch, FakeModel, FakeSearch


client = TestClient(create_app(FakeModel(), FakeSearch()))


def test_health_and_json_contract():
    assert client.get("/api/health").json()["status"] == "ok"
    response = client.post("/api/research", json={"question": "Does the product support exports?"})
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert body["claims"][0]["citations"][0]["source_id"] == body["sources"][0]["id"]
    assert "content" not in body["sources"][0]


def test_stream_contract():
    with client.stream("POST", "/api/research/stream", json={"question": "Does the product support exports?"}) as response:
        assert response.status_code == 200
        response.read()
        data = response.text
    assert "event: progress" in data
    assert "event: result" in data
    assert '"queries"' in data
    result_line = next(line for line in data.splitlines() if line.startswith("data: ") and '"question"' in line)
    assert json.loads(result_line[6:])["status"] == "completed"


def test_input_validation():
    response = client.post("/api/research", json={"question": "short"})
    assert response.status_code == 422


def test_failed_search_does_not_leak_provider_error_to_frontend():
    broken = TestClient(create_app(FakeModel(), BrokenSearch()))
    response = broken.post("/api/research", json={"question": "Does the product support exports?"})
    assert response.status_code == 502
    assert "secret" not in response.text
    with broken.stream("POST", "/api/research/stream", json={"question": "Does the product support exports?"}) as streamed:
        streamed.read()
        assert "event: error" in streamed.text
        assert "secret" not in streamed.text


def test_frontend_sample_matches_response_schema():
    sample = (Path(__file__).resolve().parents[1] / "docs/sample-response.json").read_text(encoding="utf-8")
    result = ResearchResult.model_validate_json(sample)
    assert result.status == "partial"
    assert result.claims[0].citations[0].source_id == result.sources[0].id
