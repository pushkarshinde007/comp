import {
  Incident,
  IncidentCategory,
  IncidentSeverity,
  PriorityScore,
  DuplicateAssessment,
  AuditEvent,
} from "../types/incident";

const HIGH_RISK_LOCATION_KEYWORDS = [
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
];

const STOPWORDS = new Set([
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
]);

/**
 * Calculates a deterministic priority score between 0 and 100 with an explicit mathematical breakdown.
 */
export function calculatePriorityScore(
  category: IncidentCategory | string,
  severity: IncidentSeverity,
  upvotes: number = 0,
  locationLabel: string = "",
  reportedAtIso?: string
): PriorityScore {
  // 1. Base Severity (Max 40)
  const severityMap: Record<IncidentSeverity, number> = {
    critical: 40,
    high: 26,
    medium: 14,
    low: 5,
  };
  const severityPts = severityMap[severity] ?? 10;

  // 2. Category Hazard Multiplier (Max 25)
  const cat = String(category).toLowerCase();
  let categoryPts = 12;
  if (cat.includes("water")) categoryPts = 25;
  else if (cat.includes("hazard") || cat.includes("road") || cat.includes("pothole")) categoryPts = 22;
  else if (cat.includes("light") || cat.includes("electrical") || cat.includes("power")) categoryPts = 20;
  else if (cat.includes("safety")) categoryPts = 24;
  else if (cat.includes("sanitation") || cat.includes("garbage")) categoryPts = 15;
  else if (cat.includes("park")) categoryPts = 10;

  // 3. Community Signals (Max 15)
  const communityPts = Math.min(15, Math.round(upvotes * 2.5));

  // 4. Location Risk Multiplier (Max 10)
  const locLower = (locationLabel || "").toLowerCase();
  const hasHighRiskKeyword = HIGH_RISK_LOCATION_KEYWORDS.some((kw) =>
    locLower.includes(kw)
  );
  const locationPts = hasHighRiskKeyword ? 10 : 4;

  // 5. Aging Staleness Factor (Max 10)
  let agingPts = 1;
  if (reportedAtIso) {
    const elapsedMs = Math.max(0, Date.now() - new Date(reportedAtIso).getTime());
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    if (elapsedHours >= 24) agingPts = 10;
    else if (elapsedHours >= 8) agingPts = 6;
    else if (elapsedHours >= 2) agingPts = 3;
  }

  const rawScore = severityPts + categoryPts + communityPts + locationPts + agingPts;
  const score = Math.min(100, Math.max(0, rawScore));

  let tier: "critical" | "high" | "elevated" | "routine" = "routine";
  if (score >= 80) tier = "critical";
  else if (score >= 60) tier = "high";
  else if (score >= 35) tier = "elevated";

  const explanation = `Severity (${severityPts}/40) + Category (${categoryPts}/25) + Community (${communityPts}/15) + Location Risk (${locationPts}/10) + Aging (${agingPts}/10) = ${score}/100`;

  return {
    score,
    tier,
    breakdown: {
      severityPts,
      categoryPts,
      communityPts,
      locationPts,
      agingPts,
      explanation,
    },
  };
}

/**
 * Tokenizes text and filters out stopwords.
 */
function tokenize(text: string): Set<string> {
  const matches = text.toLowerCase().match(/\b[a-zA-Z]{3,}\b/g) || [];
  return new Set(matches.filter((w) => !STOPWORDS.has(w)));
}

/**
 * Computes Jaccard similarity between two token sets.
 */
function jaccard(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/**
 * Analyzes candidate report against active incidents to identify potential duplicates.
 * Similar reports are flagged for reviewer validation, never automatically merged.
 */
export function detectPotentialDuplicates(
  candidate: {
    title: string;
    description: string;
    category: string;
    locationLabel: string;
  },
  existingIncidents: Incident[]
): DuplicateAssessment {
  const candTokens = tokenize(`${candidate.title} ${candidate.description}`);
  const candLocTokens = tokenize(candidate.locationLabel);
  const candCat = candidate.category.toLowerCase().replace(/_/g, "");

  let bestMatch: Incident | null = null;
  let highestScore = 0;
  let matchReason = "";

  for (const inc of existingIncidents) {
    if (inc.status === "resolved" || inc.status === "rejected") continue;

    const incTokens = tokenize(`${inc.title} ${inc.description}`);
    const incLocTokens = tokenize(inc.locationLabel);
    const incCat = inc.category.toLowerCase().replace(/_/g, "");

    const textSim = jaccard(candTokens, incTokens);
    const locSim = jaccard(candLocTokens, incLocTokens);
    const catSim = candCat === incCat || candCat.includes(incCat) || incCat.includes(candCat) ? 1.0 : 0.0;

    const compositeScore = (textSim * 0.40) + (locSim * 0.35) + (catSim * 0.25);

    if (compositeScore > highestScore) {
      highestScore = compositeScore;
      bestMatch = inc;

      const reasons: string[] = [];
      if (locSim > 0.3) reasons.push("nearby location");
      if (catSim > 0.5) reasons.push("matching category");
      if (textSim > 0.2) reasons.push(`${Math.round(textSim * 100)}% keyword overlap`);
      matchReason = reasons.length > 0 ? reasons.join(", ") : "correlated incident attributes";
    }
  }

  if (bestMatch && highestScore >= 0.65) {
    return {
      risk: "high",
      matchedIncident: {
        id: bestMatch.id,
        trackingCode: bestMatch.trackingCode,
        title: bestMatch.title,
        similarityScore: Math.round(highestScore * 100),
        reason: `High correlation (${Math.round(highestScore * 100)}%) with ${bestMatch.trackingCode}: ${matchReason}. Flagged for human review; not auto-merged.`,
      },
    };
  } else if (bestMatch && highestScore >= 0.38) {
    return {
      risk: "possible",
      matchedIncident: {
        id: bestMatch.id,
        trackingCode: bestMatch.trackingCode,
        title: bestMatch.title,
        similarityScore: Math.round(highestScore * 100),
        reason: `Possible correlation (${Math.round(highestScore * 100)}%) with ${bestMatch.trackingCode}: ${matchReason}. Flagged for review; not auto-merged.`,
      },
    };
  }

  return { risk: "none" };
}

/**
 * Creates an immutable audit event entry for the incident's review history.
 */
export function createAuditEvent(
  action: AuditEvent["action"],
  actor: string,
  summary: string,
  previousValue?: string,
  newValue?: string
): AuditEvent {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    actor,
    action,
    summary,
    previousValue,
    newValue,
  };
}
