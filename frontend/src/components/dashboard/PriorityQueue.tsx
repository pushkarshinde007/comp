import React from "react";
import { Clock, MapPin, ShieldAlert } from "lucide-react";
import { Incident } from "../../types/incident";
import { SeverityBadge, StatusBadge } from "../ui/Badge";

interface PriorityQueueProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

function getRelativeTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Recent";
  }
}

export const PriorityQueue: React.FC<PriorityQueueProps> = ({
  incidents,
  onSelectIncident,
}) => {
  // Filter for critical and high priority incidents that aren't resolved or rejected
  const priorityIncidents = incidents
    .filter(
      (inc) =>
        (inc.severity === "critical" || inc.severity === "high") &&
        inc.status !== "resolved" &&
        inc.status !== "rejected"
    )
    .sort((a, b) => {
      // Sort critical first, then newest
      if (a.severity === "critical" && b.severity !== "critical") return -1;
      if (b.severity === "critical" && a.severity !== "critical") return 1;
      return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
    });

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Urgent Priority Queue
            </h2>
            <p className="text-[11px] text-slate-400">
              Active critical &amp; high hazard incidents
            </p>
          </div>
        </div>
        <span className="font-mono text-xs text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded-full">
          {priorityIncidents.length} Urgent
        </span>
      </div>

      <div className="mt-3 space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
        {priorityIncidents.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No unresolved high or critical incidents currently in queue.
          </div>
        ) : (
          priorityIncidents.map((incident) => {
            const isCritical = incident.severity === "critical";

            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident(incident)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onSelectIncident(incident);
                  }
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                  isCritical
                    ? "bg-rose-950/20 border-rose-900/40 hover:border-rose-700/60"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-semibold text-cyan-400">
                      {incident.trackingCode}
                    </span>
                    <SeverityBadge severity={incident.severity} size="sm" />
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {getRelativeTime(incident.reportedAt)}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-slate-100 line-clamp-1">
                  {incident.title}
                </h4>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{incident.locationLabel}</span>
                  </span>
                  <StatusBadge status={incident.status} size="sm" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
