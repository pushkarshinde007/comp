"use client";

import React, { useState } from "react";
import { Eye, Inbox, AlertTriangle } from "lucide-react";
import {
  Incident,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
} from "../../types/incident";
import { SeverityBadge, StatusBadge, CategoryBadge } from "../ui/Badge";
import { CATEGORY_DEFINITIONS } from "../../data/mockIncidents";

interface RecentReportsTableProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const RecentReportsTable: React.FC<RecentReportsTableProps> = ({
  incidents,
  onSelectIncident,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | IncidentCategory
  >("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | IncidentStatus>(
    "all"
  );
  const [selectedSeverity, setSelectedSeverity] = useState<
    "all" | IncidentSeverity
  >("all");
  const [duplicateFilter, setDuplicateFilter] = useState<
    "all" | "duplicates_only"
  >("all");
  const [sortBy, setSortBy] = useState<"priority" | "newest" | "upvotes">(
    "priority"
  );

  const filteredIncidents = incidents.filter((inc) => {
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = inc.title.toLowerCase().includes(q);
      const matchesCode = inc.trackingCode.toLowerCase().includes(q);
      const matchesLoc = inc.locationLabel.toLowerCase().includes(q);
      if (!matchesTitle && !matchesCode && !matchesLoc) return false;
    }

    // Category filter
    if (selectedCategory !== "all" && inc.category !== selectedCategory) {
      return false;
    }

    // Status filter
    if (selectedStatus !== "all" && inc.status !== selectedStatus) {
      return false;
    }

    // Severity filter
    if (selectedSeverity !== "all" && inc.severity !== selectedSeverity) {
      return false;
    }

    // Potential Duplicate filter
    if (duplicateFilter === "duplicates_only") {
      const hasDup =
        inc.duplicateAssessment?.risk &&
        inc.duplicateAssessment.risk !== "none";
      if (!hasDup) return false;
    }

    return true;
  });

  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    if (sortBy === "priority") {
      const scoreA = a.priorityScore?.score ?? 0;
      const scoreB = b.priorityScore?.score ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
    }
    if (sortBy === "upvotes") {
      return b.upvotes - a.upvotes;
    }
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedSeverity("all");
    setDuplicateFilter("all");
    setSortBy("priority");
    onSearchChange("");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedStatus !== "all" ||
    selectedSeverity !== "all" ||
    duplicateFilter !== "all" ||
    sortBy !== "priority";

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Table Header & Filter Controls */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Incident Registry &amp; Reports Stream</span>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
              {filteredIncidents.length} Records
            </span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Verified civic reports across all monitored sectors
          </p>
        </div>

        {/* Filter Dropdowns Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value as "all" | IncidentCategory)
            }
            className="h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            aria-label="Filter by Category"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_DEFINITIONS).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as "all" | IncidentStatus)
            }
            className="h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            aria-label="Filter by Status"
          >
            <option value="all">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="verified">Verified</option>
            <option value="in_progress">In Progress</option>
            <option value="dispatched">Dispatched</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Severity Dropdown */}
          <select
            value={selectedSeverity}
            onChange={(e) =>
              setSelectedSeverity(e.target.value as "all" | IncidentSeverity)
            }
            className="h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            aria-label="Filter by Severity"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Potential Duplicate Filter */}
          <select
            value={duplicateFilter}
            onChange={(e) =>
              setDuplicateFilter(e.target.value as "all" | "duplicates_only")
            }
            className="h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            aria-label="Filter by Duplicate Risk"
          >
            <option value="all">All Risk Profiles</option>
            <option value="duplicates_only">Flagged Duplicates Only</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "priority" | "newest" | "upvotes")
            }
            className="h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
            aria-label="Sort Incidents"
          >
            <option value="priority">Sort: Priority Score</option>
            <option value="newest">Sort: Newest First</option>
            <option value="upvotes">Sort: Most Upvotes</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-8 px-2.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Priority Score</th>
              <th className="py-3 px-4">Incident Title &amp; Location</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 hidden md:table-cell">Reported</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedIncidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Inbox className="w-8 h-8 text-slate-600" />
                    <p className="text-sm font-medium text-slate-300">
                      No matching civic incidents found
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Try relaxing your filter constraints or clearing your search query.
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-2 text-xs text-cyan-400 font-mono hover:underline"
                      >
                        Clear Active Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sortedIncidents.map((incident) => {
                const date = new Date(incident.reportedAt).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );

                const hasDuplicateRisk =
                  incident.duplicateAssessment?.risk &&
                  incident.duplicateAssessment.risk !== "none";

                return (
                  <tr
                    key={incident.id}
                    onClick={() => onSelectIncident(incident)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-cyan-400 whitespace-nowrap">
                      <span>{incident.trackingCode}</span>
                      {hasDuplicateRisk && (
                        <span
                          className="ml-1.5 px-1 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/50 text-[10px] inline-flex items-center gap-0.5"
                          title="Potential duplicate flagged for review"
                        >
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>DUP</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-xs text-cyan-300 bg-cyan-950/70 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                          {incident.priorityScore?.score ?? 0}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">
                          [{incident.priorityScore?.tier ?? "routine"}]
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                        {incident.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {incident.locationLabel}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <CategoryBadge category={incident.category} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={incident.severity} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={incident.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 hidden md:table-cell">
                      {date}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(incident);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white font-medium text-[11px] transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
