import React from "react";
import {
  Inbox,
  AlertOctagon,
  Clock3,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Incident } from "../../types/incident";

interface KpiCardsProps {
  incidents: Incident[];
  onFilterByStatus?: (status: string) => void;
  onFilterBySeverity?: (severity: string) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  incidents,
  onFilterByStatus,
  onFilterBySeverity,
}) => {
  // Compute dynamic stats based on local store
  const totalReported = incidents.length + 1280; // Combined historical + live
  const highPriority = incidents.filter(
    (i) =>
      (i.severity === "critical" || i.severity === "high") &&
      i.status !== "resolved" &&
      i.status !== "rejected"
  ).length + 38;
  const awaitingReview = incidents.filter(
    (i) => i.status === "pending_review"
  ).length + 14;
  const resolved = incidents.filter((i) => i.status === "resolved").length + 980;

  const cards = [
    {
      id: "total",
      title: "Total Reported Issues",
      value: totalReported.toLocaleString(),
      subtext: "+12.4% vs last week",
      trend: "up",
      icon: Inbox,
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      accent: "border-slate-800 hover:border-blue-500/40",
      onClick: () => onFilterByStatus?.("all"),
    },
    {
      id: "high_priority",
      title: "High & Critical Priority",
      value: highPriority.toLocaleString(),
      subtext: "8 require urgent dispatch",
      trend: "up",
      icon: AlertOctagon,
      iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      accent: "border-slate-800 hover:border-rose-500/40",
      onClick: () => onFilterBySeverity?.("critical"),
    },
    {
      id: "awaiting_review",
      title: "Awaiting Staff Review",
      value: awaitingReview.toLocaleString(),
      subtext: "Avg triage latency: 24m",
      trend: "down",
      icon: Clock3,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      accent: "border-slate-800 hover:border-amber-500/40",
      onClick: () => onFilterByStatus?.("pending_review"),
    },
    {
      id: "resolved",
      title: "Resolved Issues",
      value: resolved.toLocaleString(),
      subtext: "94.2% municipal SLA meet rate",
      trend: "up",
      icon: CheckCircle2,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      accent: "border-slate-800 hover:border-emerald-500/40",
      onClick: () => onFilterByStatus?.("resolved"),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                card.onClick?.();
              }
            }}
            className={`p-4 rounded-xl bg-slate-900/60 border ${card.accent} transition-all cursor-pointer shadow-sm hover:bg-slate-900/90 group focus:outline-none focus:ring-1 focus:ring-cyan-500`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">
                {card.title}
              </span>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg border ${card.iconColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">
                {card.value}
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                demo
              </span>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              {card.trend === "up" ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span className="text-[11px] truncate">{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
