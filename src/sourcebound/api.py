from __future__ import annotations

import json
import logging
import os
import traceback
from collections.abc import AsyncIterator
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .briefing import build_briefing_graph, initial_briefing_state, public_briefing_result
from .graph import build_graph, initial_state, public_result
from .providers import DeepSeekModel, ModelProvider, SearchProvider, TavilyWebSearch
from .schemas import BriefingRequest, BriefingResult, ResearchRequest, ResearchResult

logger = logging.getLogger(__name__)


def _briefing_failure_stage(exc: Exception) -> str:
    stages = {"plan": "plan", "research": "search", "assess": "assess",
              "draft": "draft", "verify": "verify", "compose": "compose"}
    stage = "workflow"
    for frame in traceback.extract_tb(exc.__traceback__):
        if Path(frame.filename).name == "briefing.py" and frame.name in stages:
            stage = stages[frame.name]
    return stage


def _log_briefing_failure(exc: Exception) -> None:
    # Log every traceback frame without exception text or source lines: provider
    # errors may contain request details, URLs, or credentials.
    frames = traceback.extract_tb(exc.__traceback__)
    stack = "\n".join(f"{Path(frame.filename).name}:{frame.lineno} in {frame.name}" for frame in frames)
    logger.error("Briefing failed stage=%s error_type=%s\nTraceback frames:\n%s",
                 _briefing_failure_stage(exc), type(exc).__name__, stack)


def _briefing_error_message(exc: Exception) -> str:
    if isinstance(exc, RuntimeError) and str(exc) == "All Tavily searches failed":
        return "检索阶段全部失败，请稍后重试"
    return "简报生成失败，请稍后重试"


def create_app(model: ModelProvider | None = None, search: SearchProvider | None = None) -> FastAPI:
    app = FastAPI(title="Sourcebound Research API", version="0.1.0")
    origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in origins if o.strip()],
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    def workflow():
        try:
            return build_graph(model or DeepSeekModel(), search or TavilyWebSearch())
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc

    def briefing_workflow():
        try:
            model_provider = model or DeepSeekModel()
            search_provider = search or TavilyWebSearch()
            if not hasattr(search_provider, "search_recent"):
                raise RuntimeError("Search provider does not support dated search")
            return build_briefing_graph(model_provider, search_provider)
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc

    @app.get("/api/health")
    async def health() -> dict[str, bool | str]:
        return {
            "status": "ok",
            "deepseek_configured": bool(model or os.getenv("DEEPSEEK_API_KEY")),
            "tavily_configured": bool(search or os.getenv("TAVILY_API_KEY")),
        }

    @app.post("/api/research", response_model=ResearchResult)
    async def research(request: ResearchRequest) -> ResearchResult:
        graph = workflow()
        try:
            state = await graph.ainvoke(initial_state(request.question))
            return public_result(state)
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Research run failed: {type(exc).__name__}") from exc

    @app.post("/api/research/stream")
    async def research_stream(request: ResearchRequest) -> StreamingResponse:
        graph = workflow()

        async def events() -> AsyncIterator[str]:
            try:
                final = None
                async for state in graph.astream(initial_state(request.question), stream_mode="values"):
                    final = state
                    if state["trace"]:
                        latest = state["trace"][-1]
                        progress = {
                            "stage": latest["stage"], "detail": latest["detail"],
                            "queries": latest.get("queries", []),
                            "search_rounds": state["rounds"], "source_count": len(state["sources"]),
                        }
                        yield "event: progress\ndata: " + json.dumps(progress, ensure_ascii=False) + "\n\n"
                if final is None:
                    raise RuntimeError("Research graph produced no result")
                yield "event: result\ndata: " + public_result(final).model_dump_json() + "\n\n"
            except Exception as exc:
                error = {"message": "Research run failed", "type": type(exc).__name__}
                yield "event: error\ndata: " + json.dumps(error) + "\n\n"

        return StreamingResponse(events(), media_type="text/event-stream", headers={"Cache-Control": "no-cache"})

    @app.post("/api/briefing", response_model=BriefingResult)
    async def briefing(request: BriefingRequest) -> BriefingResult:
        graph = briefing_workflow()
        try:
            state = await graph.ainvoke(initial_briefing_state(request))
            return public_briefing_result(state)
        except Exception as exc:
            _log_briefing_failure(exc)
            raise HTTPException(status_code=502, detail=_briefing_error_message(exc)) from exc

    @app.post("/api/briefing/stream")
    async def briefing_stream(request: BriefingRequest) -> StreamingResponse:
        graph = briefing_workflow()

        async def events() -> AsyncIterator[str]:
            try:
                final = None
                async for state in graph.astream(initial_briefing_state(request), stream_mode="values"):
                    final = state
                    if state["trace"]:
                        latest = state["trace"][-1]
                        progress = {
                            "stage": latest["stage"], "detail": latest["detail"],
                            "queries": latest.get("queries", []),
                            "search_rounds": state["rounds"], "source_count": len(state["sources"]),
                        }
                        yield "event: progress\ndata: " + json.dumps(progress, ensure_ascii=False) + "\n\n"
                if final is None:
                    raise RuntimeError("Briefing graph produced no result")
                yield "event: result\ndata: " + public_briefing_result(final).model_dump_json() + "\n\n"
            except Exception as exc:
                _log_briefing_failure(exc)
                error = {"message": _briefing_error_message(exc), "type": type(exc).__name__}
                yield "event: error\ndata: " + json.dumps(error) + "\n\n"

        return StreamingResponse(events(), media_type="text/event-stream", headers={"Cache-Control": "no-cache"})

    return app


app = create_app()
