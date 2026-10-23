import re
from typing import List, Optional, Tuple
from app.schemas.intelligence import (
    DuplicateCheckResponse,
    DuplicateMatch,
    IncidentSummary,
    PriorityScoreResponse,
    ScoreBreakdown,
)

HIGH_RISK_LOCATION_KEYWORDS = [
    "expressway",
    "highway",
    "hospital",
    "school",
    "avenue",
    "transit",
    "market",
    "bridge",
    "boulevard",
    "freeway",
    "rail",
    "intersection",
]

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "as", "at", "be", "because", "been", "before", "being", "below",
    "between", "both", "but", "by", "could", "did", "do", "does", "doing", "down",
    "during", "each", "few", "for", "from", "further", "had", "has", "have",
    "having", "he", "her", "here", "hers", "herself", "him", "himself", "his",
    "how", "i", "if", "in", "into", "is", "it", "its", "itself", "me", "more",
    "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only",
    "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
    "same", "she", "should", "so", "some", "such", "than", "that", "the", "their",
    "theirs", "them", "themselves", "then", "there", "these", "they", "this",
    "those", "through", "to", "too", "under", "until", "up", "very", "was", "we",
    "were", "what", "when", "where", "which", "while", "who", "whom", "why",
    "with", "would", "you", "your", "yours", "yourself", "yourselves",
}


def calculate_priority_score(
    category: str,
    severity: str,
    upvotes: int = 0,
    location_label: str = "",
    hours_unresolved: float = 0.0,
) -> PriorityScoreResponse:
    # 1. Base Severity Points (Max 40)
    sev_map = {
        "critical": 40,
        "high": 26,
        "medium": 14,
        "low": 5,
    }
    severity_pts = sev_map.get(severity.lower(), 10)

    # 2. Category Hazard Multiplier (Max 25)
    cat_lower = category.lower()
    if "water" in cat_lower:
        category_pts = 25
    elif "hazard" in cat_lower or "pothole" in cat_lower:
        category_pts = 22
    elif "light" in cat_lower or "power" in cat_lower or "electric" in cat_lower:
        category_pts = 20
    elif "safety" in cat_lower:
        category_pts = 24
    elif "sanitation" in cat_lower or "garbage" in cat_lower or "waste" in cat_lower:
        category_pts = 15
    elif "park" in cat_lower:
        category_pts = 10
    else:
        category_pts = 12

    # 3. Community / Upvote Impact Factor (Max 15)
    community_pts = min(15, int(upvotes * 2.5))

    # 4. Location Risk Multiplier (Max 10)
    loc_lower = location_label.lower()
    has_high_risk_keyword = any(kw in loc_lower for kw in HIGH_RISK_LOCATION_KEYWORDS)
    location_pts = 10 if has_high_risk_keyword else 4

    # 5. Aging Staleness Factor (Max 10)
    if hours_unresolved >= 24.0:
        aging_pts = 10
    elif hours_unresolved >= 8.0:
        aging_pts = 6
    elif hours_unresolved >= 2.0:
        aging_pts = 3
    else:
        aging_pts = 1

    total_score = min(100, severity_pts + category_pts + community_pts + location_pts + aging_pts)

    if total_score >= 80:
        tier = "critical"
    elif total_score >= 60:
        tier = "high"
    elif total_score >= 35:
        tier = "elevated"
    else:
        tier = "routine"

    explanation = (
        f"Base Severity ({severity_pts}/40) + Category Hazard ({category_pts}/25) + "
        f"Community Signals ({community_pts}/15) + Location Risk ({location_pts}/10) + "
        f"Aging Factor ({aging_pts}/10) = {total_score}/100 [{tier.upper()}]"
    )

    return PriorityScoreResponse(
        score=total_score,
        tier=tier,
        breakdown=ScoreBreakdown(
            severity_pts=severity_pts,
            category_pts=category_pts,
            community_pts=community_pts,
            location_pts=location_pts,
            aging_pts=aging_pts,
            explanation=explanation,
        ),
    )


def tokenize_text(text: str) -> set[str]:
    words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
    return {w for w in words if w not in STOPWORDS}


def jaccard_similarity(set_a: set[str], set_b: set[str]) -> float:
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union > 0 else 0.0


def check_potential_duplicates(
    candidate_title: str,
    candidate_description: str,
    candidate_category: str,
    candidate_location: str,
    active_incidents: List[IncidentSummary],
) -> DuplicateCheckResponse:
    cand_tokens = tokenize_text(candidate_title + " " + candidate_description)
    cand_loc_tokens = tokenize_text(candidate_location)
    cand_cat = candidate_category.lower().replace("_", "")

    best_match: Optional[Tuple[IncidentSummary, float, str]] = None
    highest_score = 0.0

    for inc in active_incidents:
        if inc.status in ("resolved", "rejected"):
            continue

        inc_tokens = tokenize_text(inc.title + " " + inc.description)
        inc_loc_tokens = tokenize_text(inc.location_label)
        inc_cat = inc.category.lower().replace("_", "")

        # 1. Text description similarity (weight 0.40)
        text_sim = jaccard_similarity(cand_tokens, inc_tokens)

        # 2. Location token similarity (weight 0.35)
        loc_sim = jaccard_similarity(cand_loc_tokens, inc_loc_tokens)

        # 3. Category match bonus (weight 0.25)
        cat_sim = 1.0 if cand_cat == inc_cat or cand_cat in inc_cat or inc_cat in cand_cat else 0.0

        composite_score = (text_sim * 0.40) + (loc_sim * 0.35) + (cat_sim * 0.25)

        if composite_score > highest_score:
            highest_score = composite_score
            reasons = []
            if loc_sim > 0.3:
                reasons.append("similar street/intersection")
            if cat_sim > 0.5:
                reasons.append("matching category")
            if text_sim > 0.25:
                reasons.append(f"{int(text_sim*100)}% keyword overlap")
            reason_str = ", ".join(reasons) if reasons else "correlated incident characteristics"
            best_match = (inc, composite_score, reason_str)

    if best_match and highest_score >= 0.70:
        inc, score, reason_str = best_match
        return DuplicateCheckResponse(
            duplicate_risk="high",
            matched_incident=DuplicateMatch(
                id=inc.id,
                tracking_code=inc.tracking_code,
                title=inc.title,
                similarity_score=round(score * 100, 1),
                reason=f"High similarity ({int(score*100)}%) with {inc.tracking_code}: {reason_str}. Flagged for review; not auto-merged.",
            ),
        )
    elif best_match and highest_score >= 0.40:
        inc, score, reason_str = best_match
        return DuplicateCheckResponse(
            duplicate_risk="possible",
            matched_incident=DuplicateMatch(
                id=inc.id,
                tracking_code=inc.tracking_code,
                title=inc.title,
                similarity_score=round(score * 100, 1),
                reason=f"Possible correlation ({int(score*100)}%) with {inc.tracking_code}: {reason_str}. Flagged for review; not auto-merged.",
            ),
        )

    return DuplicateCheckResponse(duplicate_risk="none", matched_incident=None)
