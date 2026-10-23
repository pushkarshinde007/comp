import React from "react";
import {
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
} from "../../types/incident";
import { CATEGORY_DEFINITIONS } from "../../data/mockIncidents";

interface SeverityBadgeProps {
  severity: IncidentSeverity;
  size?: "sm" | "md";
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = "md",
}) => {
  const styles: Record<
    IncidentSeverity,
    { label: string; bg: string; dot: string }
  > = {
    critical: {
      label: "Critical",
      bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      dot: "bg-rose-500",
    },
    high: {
      label: "High",
      bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      dot: "bg-amber-500",
    },
    medium: {
      label: "Medium",
      bg: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      dot: "bg-sky-500",
    },
    low: {
      label: "Low",
      bg: "bg-slate-500/10 text-slate-400 border-slate-500/30",
      dot: "bg-slate-400",
    },
  };

  const current = styles[severity];
  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 tracking-wide"
      : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full font-mono uppercase ${current.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};

interface StatusBadgeProps {
  status: IncidentStatus;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
}) => {
  const styles: Record<IncidentStatus, { label: string; bg: string }> = {
    pending_review: {
      label: "Pending Review",
      bg: "bg-amber-950/40 text-amber-300 border-amber-700/40",
    },
    verified: {
      label: "Verified",
      bg: "bg-blue-950/40 text-blue-300 border-blue-700/40",
    },
    in_progress: {
      label: "In Progress",
      bg: "bg-indigo-950/40 text-indigo-300 border-indigo-700/40",
    },
    dispatched: {
      label: "Dispatched",
      bg: "bg-teal-950/40 text-teal-300 border-teal-700/40",
    },
    resolved: {
      label: "Resolved",
      bg: "bg-emerald-950/40 text-emerald-300 border-emerald-700/40",
    },
    rejected: {
      label: "Rejected",
      bg: "bg-slate-900 text-slate-400 border-slate-800",
    },
  };

  const current = styles[status] || styles.pending_review;
  const sizeClasses =
    size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-md ${current.bg} ${sizeClasses}`}
    >
      {current.label}
    </span>
  );
};

interface CategoryBadgeProps {
  category: IncidentCategory;
  size?: "sm" | "md";
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = "md",
}) => {
  const meta = CATEGORY_DEFINITIONS[category] || {
    label: category,
    badgeBg: "bg-slate-800 text-slate-300 border-slate-700",
  };
  const sizeClasses =
    size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-0.5";

  return (
    <span
      className={`inline-flex items-center border rounded-md font-medium ${meta.badgeBg} ${sizeClasses}`}
    >
      {meta.label}
    </span>
  );
};
