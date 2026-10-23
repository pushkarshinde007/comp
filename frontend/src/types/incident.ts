export type IncidentSeverity = "critical" | "high" | "medium" | "low";

export type IncidentStatus =
  | "pending_review"
  | "verified"
  | "in_progress"
  | "dispatched"
  | "resolved"
  | "rejected";

export type IncidentCategory =
  | "road_hazard"
  | "water_utility"
  | "electrical_lighting"
  | "sanitation_dumping"
  | "public_safety"
  | "parks_infrastructure";

export interface GeoCoordinate {
  x: number; // Percent 0-100 across simulated city grid
  y: number; // Percent 0-100 down simulated city grid
  district: string;
}

export interface Incident {
  id: string;
  trackingCode: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  locationLabel: string;
  coordinates: GeoCoordinate;
  reportedAt: string; // ISO string
  reportedBy: string;
  upvotes: number;
  imageUrl?: string;
  aiAssessment?: {
    confidence: number;
    suggestedCategory: IncidentCategory;
    urgencyReasoning: string;
    duplicateRisk: "none" | "possible" | "high";
  };
  geminiAnalysis?: RealGeminiAnalysis;
  reviewNotes?: string;
  assignedDepartment?: string;
}

export interface RealGeminiAnalysis {
  category: "pothole" | "garbage" | "streetlight" | "water_leak" | "other";
  summary: string;
  observed_evidence: string[];
  uncertainty_notes: string;
  suggested_urgency: "low" | "medium" | "high" | "critical";
  recommended_action: string;
  evidence_basis: "description" | "image" | "both";
  analyzedAt: string;
  model: string;
  requestId: string;
}

export interface IncidentFilter {
  searchQuery: string;
  category: "all" | IncidentCategory;
  status: "all" | IncidentStatus;
  severity: "all" | IncidentSeverity;
}

export interface DashboardKpi {
  totalReported: number;
  highPriority: number;
  awaitingReview: number;
  resolved: number;
  trends: {
    totalChangePct: number;
    highPriorityChangePct: number;
    avgResolutionHours: number;
  };
}

export type ActiveView =
  | "overview"
  | "live_issues"
  | "map_view"
  | "analytics"
  | "review_queue";
