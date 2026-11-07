from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Literal
from urllib.parse import urlsplit

from pydantic import BaseModel, Field, field_validator


class ClaimStatus(StrEnum):
    supported = "supported"
    disputed = "disputed"
    insufficient = "insufficient"


class Citation(BaseModel):
    source_id: str
    quote: str


class Claim(BaseModel):
    text: str
    status: ClaimStatus
    citations: list[Citation] = Field(default_factory=list)
    note: str = ""


class Source(BaseModel):
    id: str
    title: str
    url: str
    query: str
    snippet: str
    retrieved_at: datetime
    published_at: str | None = None
    source_type: Literal["official", "external", "unclassified"] = "unclassified"


class TraceStep(BaseModel):
    stage: str
    detail: str
    queries: list[str] = Field(default_factory=list)


class ResearchRequest(BaseModel):
    question: str = Field(min_length=8, max_length=1000)


class ResearchResult(BaseModel):
    question: str
    answer: str
    claims: list[Claim]
    sources: list[Source]
    gaps: list[str]
    trace: list[TraceStep]
    search_rounds: int
    status: str


class BriefingRequest(BaseModel):
    entity: str = Field(min_length=2, max_length=160)
    entity_type: Literal["company", "person"] = "company"
    organization: str | None = Field(default=None, max_length=160)
    attendee: str | None = Field(default=None, max_length=160)
    official_domain: str | None = Field(default=None, max_length=253)
    meeting_at: datetime
    meeting_goal: str = Field(default="商务合作交流", max_length=300)
    language: Literal["zh", "en"] = "zh"

    @field_validator("entity")
    @classmethod
    def require_named_entity(cls, value: str) -> str:
        name = value.strip()
        if len(name) < 2:
            raise ValueError("entity must contain at least two non-space characters")
        return name

    @field_validator("meeting_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.utcoffset() is None:
            raise ValueError("meeting_at must include a timezone offset")
        return value

    @field_validator("official_domain")
    @classmethod
    def normalize_domain(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        raw = value.strip().lower()
        parsed = urlsplit(raw if "://" in raw else "https://" + raw)
        hostname = parsed.hostname or ""
        if (parsed.scheme not in {"http", "https"} or not hostname or "." not in hostname
                or parsed.username or parsed.password or parsed.port
                or parsed.path not in {"", "/"} or parsed.query or parsed.fragment):
            raise ValueError("official_domain must be a domain or website homepage URL")
        return hostname.removeprefix("www.")


class BriefingDevelopment(BaseModel):
    id: str
    date: str
    date_basis: Literal["explicit_event_date", "source_publication"] = "source_publication"
    date_evidence: Citation | None = None
    fact: str
    meeting_implication: str
    citations: list[Citation]


class BriefingQuestion(BaseModel):
    question: str
    reason: str
    development_ids: list[str]


class BriefingResult(BaseModel):
    entity: str
    entity_type: Literal["company", "person"] = "company"
    organization: str | None = None
    attendee: str | None = None
    official_domain: str | None = None
    meeting_at: datetime
    meeting_goal: str
    language: Literal["zh", "en"]
    window_start: datetime
    window_end: datetime
    generated_at: datetime | None = None
    headline: str
    developments: list[BriefingDevelopment]
    questions: list[BriefingQuestion]
    gaps: list[str]
    sources: list[Source]
    trace: list[TraceStep]
    research_stats: dict[str, int] = Field(default_factory=dict)
    status: str
