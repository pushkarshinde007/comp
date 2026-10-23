import React from "react";
import { BarChart2, PieChart, Activity, Zap } from "lucide-react";
import { Incident, IncidentCategory } from "../../types/incident";
import { CATEGORY_DEFINITIONS } from "../../data/mockIncidents";

interface ActivitySummaryProps {
  incidents: Incident[];
}

export const ActivitySummary: React.FC<ActivitySummaryProps> = ({
  incidents,
}) => {
  // Compute category distribution
  const categoryCounts: Record<IncidentCategory, number> = {
    road_hazard: 0,
    water_utility: 0,
    electrical_lighting: 0,
    sanitation_dumping: 0,
    public_safety: 0,
    parks_infrastructure: 0,
  };

  incidents.forEach((inc) => {
    if (categoryCounts[inc.category] !== undefined) {
      categoryCounts[inc.category]++;
    }
  });

  const total = Math.max(1, incidents.length);

  // 7-day intake trend simulation
  const weeklyTrend = [
    { day: "Mon", count: 18, height: "45%" },
    { day: "Tue", count: 24, height: "60%" },
    { day: "Wed", count: 32, height: "80%" },
    { day: "Thu", count: 28, height: "70%" },
    { day: "Fri", count: 38, height: "95%" },
    { day: "Sat", count: 22, height: "55%" },
    { day: "Sun", count: 15, height: "38%" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Category Breakdown Panel */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Category Volume Distribution
                </h3>
                <p className="text-[11px] text-slate-400">
                  Relative proportion across civic domains
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {incidents.length} active samples
            </span>
          </div>

          {/* Progress Bars for Categories */}
          <div className="mt-4 space-y-3">
            {Object.entries(CATEGORY_DEFINITIONS).map(([catKey, meta]) => {
              const count = categoryCounts[catKey as IncidentCategory] || 0;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">
                      {meta.label}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(5, pct)}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Leading domain: Water &amp; Utility</span>
          <span>SLA target: &lt; 24h</span>
        </div>
      </div>

      {/* 7-Day Ingestion Trend Panel */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  7-Day Incident Influx
                </h3>
                <p className="text-[11px] text-slate-400">
                  Daily intake volume &amp; peak surge intervals
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Stable Pace
            </span>
          </div>

          {/* CSS-Based Bar Chart */}
          <div className="mt-6 flex items-end justify-between h-40 pt-4 px-2">
            {weeklyTrend.map((item) => (
              <div
                key={item.day}
                className="flex flex-col items-center gap-2 flex-1 group"
              >
                <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.count}
                </span>
                <div className="w-8 sm:w-10 rounded-t-md bg-slate-800 group-hover:bg-cyan-500/80 transition-all relative flex flex-col justify-end overflow-hidden"
                     style={{ height: item.height }}>
                  <div className="w-full h-1 bg-cyan-400" />
                </div>
                <span className="text-[11px] font-mono text-slate-400 mt-1">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Velocity Metrics Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block">
              Avg Daily Intake:
            </span>
            <span className="font-mono text-white font-semibold">
              25.3 reports/day
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">
              Resolution Velocity:
            </span>
            <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" /> 18.2 hrs avg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
