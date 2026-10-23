from typing import List, Optional
from pydantic import BaseModel, Field


class PriorityScoreRequest(BaseModel):
    category: str = Field(..., description="Category of the civic incident")
    severity: str = Field(..., description="Reported severity: critical, high, medium, low")
    upvotes: int = Field(default=0, ge=0, description="Community upvote count")
    location_label: Optional[str] = Field(default="", description="Location or street name")
    hours_unresolved: float = Field(default=0.0, ge=0.0, description="Hours since initial report")


class ScoreBreakdown(BaseModel):
    severity_pts: int
    category_pts: int
    community_pts: int
    location_pts: int
    aging_pts: int
    explanation: str


class PriorityScoreResponse(BaseModel):
    score: int = Field(..., ge=0, le=100)
    tier: str
    breakdown: ScoreBreakdown


class IncidentSummary(BaseModel):
    id: str
    tracking_code: str
    title: str
    description: str
    category: str
    location_label: str
    status: str


class DuplicateCheckRequest(BaseModel):
    candidate_title: str
    candidate_description: str
    candidate_category: str
    candidate_location: str
    active_incidents: List[IncidentSummary]


class DuplicateMatch(BaseModel):
    id: str
    tracking_code: str
    title: str
    similarity_score: float
    reason: str


class DuplicateCheckResponse(BaseModel):
    duplicate_risk: str  # "none", "possible", "high"
    matched_incident: Optional[DuplicateMatch] = None
