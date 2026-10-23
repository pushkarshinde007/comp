from fastapi import APIRouter
from app.schemas.intelligence import (
    DuplicateCheckRequest,
    DuplicateCheckResponse,
    PriorityScoreRequest,
    PriorityScoreResponse,
)
from app.services.intelligence_service import (
    calculate_priority_score,
    check_potential_duplicates,
)

router = APIRouter(prefix="/api/v1", tags=["Civic Intelligence"])


@router.post(
    "/calculate-priority",
    response_model=PriorityScoreResponse,
    summary="Calculate deterministic priority score",
    description="Calculates a transparent 0-100 score based on severity, category hazard, community upvotes, location risk, and aging.",
)
def compute_priority(payload: PriorityScoreRequest) -> PriorityScoreResponse:
    return calculate_priority_score(
        category=payload.category,
        severity=payload.severity,
        upvotes=payload.upvotes,
        location_label=payload.location_label or "",
        hours_unresolved=payload.hours_unresolved,
    )


@router.post(
    "/detect-duplicate",
    response_model=DuplicateCheckResponse,
    summary="Detect potential duplicate civic reports",
    description="Compares a candidate report against active incidents to identify potential duplicates without auto-merging.",
)
def detect_duplicate(payload: DuplicateCheckRequest) -> DuplicateCheckResponse:
    return check_potential_duplicates(
        candidate_title=payload.candidate_title,
        candidate_description=payload.candidate_description,
        candidate_category=payload.candidate_category,
        candidate_location=payload.candidate_location,
        active_incidents=payload.active_incidents,
    )
