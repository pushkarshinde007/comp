"use client";

import React, { useState } from "react";
import {
  MapPin,
  Info,
  Navigation,
  Eye,
} from "lucide-react";
import { Incident, IncidentSeverity } from "../../types/incident";
import { SeverityBadge, CategoryBadge } from "../ui/Badge";

interface IncidentMapPanelProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
}

export const IncidentMapPanel: React.FC<IncidentMapPanelProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
}) => {
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<
    "all" | IncidentSeverity
  >("all");
  const [hoveredIncident, setHoveredIncident] = useState<Incident | null>(null);

  const filteredIncidents = incidents.filter((inc) => {
    if (activeSeverityFilter === "all") return true;
    return inc.severity === activeSeverityFilter;
  });

  const getMarkerColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case "critical":
        return "bg-rose-500 border-rose-300 ring-rose-500/40 text-white";
      case "high":
        return "bg-amber-500 border-amber-300 ring-amber-500/40 text-black";
      case "medium":
        return "bg-sky-500 border-sky-300 ring-sky-500/40 text-white";
      case "low":
        return "bg-slate-400 border-slate-200 ring-slate-500/40 text-black";
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-sm flex flex-col">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Metropolitan Incident Grid</span>
              <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                Simulated Canvas
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Interactive spatial density across municipal sectors
            </p>
          </div>
        </div>

        {/* Quick Severity Filter & Legend */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "critical", "high", "medium", "low"] as const).map(
            (sev) => {
              const count =
                sev === "all"
                  ? incidents.length
                  : incidents.filter((i) => i.severity === sev).length;
              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setActiveSeverityFilter(sev)}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-mono uppercase transition-colors border ${
                    activeSeverityFilter === sev
                      ? "bg-slate-800 text-cyan-300 border-cyan-500/50"
                      : "text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-900"
                  }`}
                >
                  {sev} ({count})
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Map Canvas Area */}
      <div className="relative w-full h-[360px] sm:h-[420px] bg-[#070b14] overflow-hidden select-none">
        {/* City Grid Background Texture (SVG Vector Grid) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#334155"
                strokeWidth="0.8"
              />
            </pattern>
            <pattern
              id="grid-major"
              width="160"
              height="160"
              patternUnits="userSpaceOnUse"
            >
              <rect width="160" height="160" fill="url(#grid-pattern)" />
              <path
                d="M 160 0 L 0 0 0 160"
                fill="none"
                stroke="#475569"
                strokeWidth="1.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-major)" />

          {/* Simulated River / Natural Corridor */}
          <path
            d="M 0,320 Q 220,290 400,340 T 900,310 L 900,380 T 400,410 Q 220,360 0,390 Z"
            fill="#0f2842"
            opacity="0.4"
          />

          {/* Simulated Major Arterial Thoroughfares */}
          <line
            x1="0"
            y1="180"
            x2="100%"
            y2="180"
            stroke="#1e293b"
            strokeWidth="4"
          />
          <line
            x1="320"
            y1="0"
            x2="320"
            y2="100%"
            stroke="#1e293b"
            strokeWidth="4"
          />
          <line
            x1="640"
            y1="0"
            x2="640"
            y2="100%"
            stroke="#1e293b"
            strokeWidth="3"
          />
        </svg>

        {/* District Watermark Labels */}
        <div className="absolute top-4 left-4 pointer-events-none text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          District 4: River West Corridor
        </div>
        <div className="absolute top-4 right-4 pointer-events-none text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          District 3: East Hills
        </div>
        <div className="absolute bottom-4 left-4 pointer-events-none text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          District 2: Central Metro Hub
        </div>
        <div className="absolute bottom-4 right-4 pointer-events-none text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          District 1: Northgate Sector
        </div>

        {/* Explicit Map Disclaimer */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-1.5 shadow-sm">
          <Info className="w-3 h-3 text-cyan-400" />
          <span>Simulated Grid &bull; Real GIS integration arrives in Phase 2</span>
        </div>

        {/* Positioned Markers */}
        {filteredIncidents.map((incident) => {
          const isSelected = selectedIncident?.id === incident.id;
          const isHovered = hoveredIncident?.id === incident.id;
          const markerClass = getMarkerColor(incident.severity);

          return (
            <div
              key={incident.id}
              style={{
                left: `${incident.coordinates.x}%`,
                top: `${incident.coordinates.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform duration-150 hover:scale-125"
              onClick={() => onSelectIncident(incident)}
              onMouseEnter={() => setHoveredIncident(incident)}
              onMouseLeave={() => setHoveredIncident(null)}
              role="button"
              tabIndex={0}
              aria-label={`Incident ${incident.trackingCode}: ${incident.title}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectIncident(incident);
                }
              }}
            >
              {/* Pulse Ring for Critical Items */}
              {incident.severity === "critical" && (
                <span className="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
              )}

              {/* Marker Icon Pin */}
              <div
                className={`relative flex items-center justify-center w-7 h-7 rounded-full border-2 shadow-lg ring-4 transition-all ${markerClass} ${
                  isSelected ? "scale-125 ring-cyan-400 ring-offset-2 ring-offset-slate-950" : ""
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
              </div>

              {/* Marker Hover Tooltip */}
              {(isHovered || isSelected) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-lg bg-slate-950/95 border border-slate-700 shadow-2xl text-left pointer-events-none z-30">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] text-cyan-400">
                      {incident.trackingCode}
                    </span>
                    <SeverityBadge severity={incident.severity} size="sm" />
                  </div>
                  <p className="text-xs font-semibold text-white line-clamp-1">
                    {incident.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {incident.locationLabel}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Selected Incident Floating Bottom Bar */}
        {selectedIncident && (
          <div className="absolute bottom-3 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 p-3 rounded-xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 z-20">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[11px] text-cyan-400 font-semibold">
                  {selectedIncident.trackingCode}
                </span>
                <CategoryBadge category={selectedIncident.category} size="sm" />
                <SeverityBadge severity={selectedIncident.severity} size="sm" />
              </div>
              <h4 className="text-xs font-medium text-white truncate">
                {selectedIncident.title}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {selectedIncident.locationLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectIncident(selectedIncident)}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider font-mono">
            Severity Legend:
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Low</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Click any pin to inspect summary and review actions
        </div>
      </div>
    </div>
  );
};
