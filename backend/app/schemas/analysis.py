from enum import Enum
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class GeminiCategory(str, Enum):
    POTHOLE = "pothole"
    GARBAGE = "garbage"
    STREETLIGHT = "streetlight"
    WATER_LEAK = "water_leak"
    OTHER = "other"


class SuggestedUrgency(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class EvidenceBasis(str, Enum):
    DESCRIPTION = "description"
    IMAGE = "image"
    BOTH = "both"


class StructuredAnalysis(BaseModel):
    category: GeminiCategory = Field(
        ...,
        description="Categorization of the civic issue: pothole, garbage, streetlight, water_leak, or other"
    )
    summary: str = Field(
        ...,
        max_length=500,
        description="Concise factual description of the reported issue"
    )
    observed_evidence: List[str] = Field(
        default_factory=list,
        description="Concrete factual details actually visible in the image or explicitly stated in the description"
    )
    uncertainty_notes: str = Field(
        ...,
        description="Missing details, camera angle ambiguity, or limitations regarding the report"
    )
    suggested_urgency: SuggestedUrgency = Field(
        ...,
        description="Suggested urgency for municipal triage: low, medium, high, or critical"
    )
    recommended_action: str = Field(
        ...,
        description="A practical municipal responder or citizen next step"
    )
    evidence_basis: EvidenceBasis = Field(
        ...,
        description="Whether findings primarily came from the description, image, or both"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "category": "pothole",
                "summary": "Substantial pothole in the roadway with exposed subsurface material.",
                "observed_evidence": [
                    "Circular crater approximately 2 feet in diameter",
                    "Dislodged asphalt aggregates surrounding the depression"
                ],
                "uncertainty_notes": "Exact depth cannot be measured from photo angle; no scale reference present.",
                "suggested_urgency": "high",
                "recommended_action": "Dispatch road maintenance for asphalt cold-patch repair.",
                "evidence_basis": "both"
            }
        }
    }


class IssueAnalysisResponse(BaseModel):
    request_id: str = Field(..., description="Unique request tracing identifier")
    status: Literal["completed", "unconfigured", "error"] = Field(
        ..., description="Execution status of the AI analysis"
    )
    analysis: Optional[StructuredAnalysis] = Field(
        None, description="Validated structured analysis from Gemini"
    )
    model: Optional[str] = Field(None, description="Gemini model identifier used")
    message: Optional[str] = Field(
        None, description="Informational message, configuration status, or error summary"
    )
