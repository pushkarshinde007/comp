import { Incident, IncidentCategory } from "../types/incident";

export interface CategoryMeta {
  label: string;
  description: string;
  color: string;
  badgeBg: string;
}

export const CATEGORY_DEFINITIONS: Record<IncidentCategory, CategoryMeta> = {
  road_hazard: {
    label: "Road Hazard",
    description: "Potholes, sinkholes, broken curbs, damaged guardrails",
    color: "#f59e0b",
    badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  water_utility: {
    label: "Water & Utility",
    description: "Broken mains, hydrants, localized flooding, gas odors",
    color: "#06b6d4",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  electrical_lighting: {
    label: "Lighting & Power",
    description: "Dark streetlights, exposed wiring, damaged transformers",
    color: "#eab308",
    badgeBg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  sanitation_dumping: {
    label: "Sanitation & Waste",
    description: "Illegal dumping, hazardous materials, overflowing public bins",
    color: "#8b5cf6",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  public_safety: {
    label: "Public Safety",
    description: "Damaged signals, fallen branches, structural hazards",
    color: "#ef4444",
    badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  parks_infrastructure: {
    label: "Parks & Facilities",
    description: "Playground damage, broken benches, trail washouts",
    color: "#10b981",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
};

export const INITIAL_MOCK_INCIDENTS: Incident[] = [
  {
    id: "inc-001",
    trackingCode: "CIV-8921",
    title: "Burst Water Main Flooding Intersection",
    description:
      "High-pressure water main rupture causing severe roadway flooding across 4th & Market St. Asphalt is buckling and water is rising toward ground-floor storefronts.",
    category: "water_utility",
    severity: "critical",
    status: "dispatched",
    locationLabel: "4th St & Market St (Financial District)",
    coordinates: { x: 34, y: 48, district: "District 2 - Central" },
    reportedAt: "2026-10-23T07:15:00Z",
    reportedBy: "Resident #418",
    upvotes: 42,
    assignedDepartment: "Municipal Water Works - Emergency Unit 4",
    reviewNotes: "Dispatched crew at 07:30. Water valve isolated.",
    aiAssessment: {
      confidence: 0.96,
      suggestedCategory: "water_utility",
      urgencyReasoning:
        "Structural risk to pavement and imminent commercial property damage.",
      duplicateRisk: "none",
    },
  },
  {
    id: "inc-002",
    trackingCode: "CIV-8924",
    title: "Deep Pothole with Exposed Rebar",
    description:
      "Deep crater in center lane of Oakway Expressway westbound. Multiple vehicles reported blown tires and bent rims during morning commute.",
    category: "road_hazard",
    severity: "high",
    status: "verified",
    locationLabel: "Oakway Expressway, Mile Marker 4.2",
    coordinates: { x: 62, y: 28, district: "District 5 - West Corridor" },
    reportedAt: "2026-10-23T08:04:00Z",
    reportedBy: "CommuterTransit #88",
    upvotes: 19,
    assignedDepartment: "Dept of Transportation - Road Repair",
    reviewNotes: "Prioritized for cold-patch emergency repair today.",
    aiAssessment: {
      confidence: 0.92,
      suggestedCategory: "road_hazard",
      urgencyReasoning:
        "High vehicular traffic speed increases risk of collision or loss of control.",
      duplicateRisk: "possible",
    },
  },
  {
    id: "inc-003",
    trackingCode: "CIV-8930",
    title: "Dark Streetlight Cluster Outside Elementary School",
    description:
      "Six consecutive LED streetlights are non-functional on 12th Avenue between Cedar and Spruce. Pedestrian crossing is completely dark during morning arrival.",
    category: "electrical_lighting",
    severity: "high",
    status: "pending_review",
    locationLabel: "12th Ave & Cedar St (Northgate)",
    coordinates: { x: 78, y: 65, district: "District 1 - Northgate" },
    reportedAt: "2026-10-23T09:40:00Z",
    reportedBy: "SchoolZoneWatch",
    upvotes: 31,
    assignedDepartment: "Public Lighting Division",
    aiAssessment: {
      confidence: 0.89,
      suggestedCategory: "electrical_lighting",
      urgencyReasoning:
        "Proximity to active school crosswalk elevates risk profile.",
      duplicateRisk: "none",
    },
  },
  {
    id: "inc-004",
    trackingCode: "CIV-8935",
    title: "Illegal Industrial Debris Dumped Along Greenway",
    description:
      "Multiple industrial barrels, chemical containers, and construction demolition debris dumped along the public cycling trail near access gate 3.",
    category: "sanitation_dumping",
    severity: "medium",
    status: "pending_review",
    locationLabel: "Riverside Greenway Access Rd 3",
    coordinates: { x: 22, y: 74, district: "District 4 - River West" },
    reportedAt: "2026-10-23T10:12:00Z",
    reportedBy: "CivicVolunteer #12",
    upvotes: 8,
    assignedDepartment: "Environmental Protection Bureau",
    aiAssessment: {
      confidence: 0.85,
      suggestedCategory: "sanitation_dumping",
      urgencyReasoning:
        "Hazardous chemical markers require HazMat-certified inspection.",
      duplicateRisk: "none",
    },
  },
  {
    id: "inc-005",
    trackingCode: "CIV-8941",
    title: "Pedestrian Crossing Signal Stuck on Red in All Directions",
    description:
      "Walk signal at busy transit junction is deadlocked, causing pedestrians to step into high-speed vehicular traffic out of frustration.",
    category: "public_safety",
    severity: "critical",
    status: "in_progress",
    locationLabel: "8th Ave & Broad St (Transit Hub)",
    coordinates: { x: 45, y: 35, district: "District 2 - Central" },
    reportedAt: "2026-10-23T11:05:00Z",
    reportedBy: "MetroRider #902",
    upvotes: 54,
    assignedDepartment: "Traffic Systems Management",
    reviewNotes: "Field engineer dispatched to reset signal control cabinet.",
    aiAssessment: {
      confidence: 0.94,
      suggestedCategory: "public_safety",
      urgencyReasoning:
        "Critical pedestrian conflict area with high hourly foot traffic.",
      duplicateRisk: "possible",
    },
  },
  {
    id: "inc-006",
    trackingCode: "CIV-8948",
    title: "Damaged Playground Swing Support Strut",
    description:
      "Crossbeam on double swing set fractured, leaving exposed rusted bolts and unstable timber frame.",
    category: "parks_infrastructure",
    severity: "medium",
    status: "resolved",
    locationLabel: "Sunset Park - Children's Play Area",
    coordinates: { x: 85, y: 22, district: "District 3 - East Hills" },
    reportedAt: "2026-10-22T14:30:00Z",
    reportedBy: "ParentCouncil",
    upvotes: 14,
    assignedDepartment: "Parks & Recreation Maintenance",
    reviewNotes: "Area taped off, replacement beam installed, safety certified.",
    aiAssessment: {
      confidence: 0.88,
      suggestedCategory: "parks_infrastructure",
      urgencyReasoning: "Fall hazard for children; non-fatal structural issue.",
      duplicateRisk: "none",
    },
  },
  {
    id: "inc-007",
    trackingCode: "CIV-8952",
    title: "Storm Drain Clogged by Tree Limbs and Litter",
    description:
      "Heavy rainwater pooling 6 inches deep across bicycle lane due to densely compacted leaf debris over municipal catch basin.",
    category: "water_utility",
    severity: "low",
    status: "in_progress",
    locationLabel: "Elm St between 14th & 15th",
    coordinates: { x: 50, y: 82, district: "District 1 - Northgate" },
    reportedAt: "2026-10-23T11:45:00Z",
    reportedBy: "CyclistAlliance",
    upvotes: 5,
    assignedDepartment: "Drainage & Sewer Division",
    aiAssessment: {
      confidence: 0.81,
      suggestedCategory: "water_utility",
      urgencyReasoning: "Localized surface pooling; low structural impact.",
      duplicateRisk: "none",
    },
  },
  {
    id: "inc-008",
    trackingCode: "CIV-8955",
    title: "Faded High-Visibility Crosswalk Markings",
    description:
      "Thermal plastic crosswalk lines nearly invisible under rain conditions near Senior Community Center.",
    category: "road_hazard",
    severity: "low",
    status: "verified",
    locationLabel: "Beacon Blvd at Grand Ave",
    coordinates: { x: 18, y: 15, district: "District 4 - River West" },
    reportedAt: "2026-10-23T12:10:00Z",
    reportedBy: "SeniorActionNetwork",
    upvotes: 27,
    assignedDepartment: "Dept of Transportation - Striping",
    aiAssessment: {
      confidence: 0.79,
      suggestedCategory: "road_hazard",
      urgencyReasoning: "Scheduled maintenance backlog candidate.",
      duplicateRisk: "none",
    },
  },
];
