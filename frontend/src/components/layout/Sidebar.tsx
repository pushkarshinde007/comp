"use client";

import React from "react";
import {
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  BarChart3,
  CheckSquare,
  PlusCircle,
  Radio,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { ActiveView } from "../../types/incident";

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  pendingReviewCount: number;
  onOpenReportModal: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  pendingReviewCount,
  onOpenReportModal,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: "overview" as ActiveView,
      label: "Overview",
      icon: LayoutDashboard,
      description: "Metrics & live stream",
    },
    {
      id: "live_issues" as ActiveView,
      label: "Live Issues",
      icon: AlertTriangle,
      description: "All citizen reports",
    },
    {
      id: "map_view" as ActiveView,
      label: "Map View",
      icon: MapPin,
      description: "Geographic distribution",
    },
    {
      id: "analytics" as ActiveView,
      label: "Analytics",
      icon: BarChart3,
      description: "Trends & resolution",
    },
    {
      id: "review_queue" as ActiveView,
      label: "Review Queue",
      icon: CheckSquare,
      badge: pendingReviewCount,
      description: "Triage & verification",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-200 ease-in-out lg:static ${
          isMobileOpen
            ? "translate-x-0 w-72"
            : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
        aria-label="Sidebar Navigation"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 font-mono font-bold shrink-0">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm tracking-tight text-white truncate">
                  CivicSignal AI
                </span>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Ops Console
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              onOpenReportModal();
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs sm:text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 ${
              isCollapsed ? "px-0" : ""
            }`}
            title="Report a Civic Issue"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Report Incident</span>}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectView(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all relative ${
                  isActive
                    ? "bg-slate-900 text-cyan-400 font-medium border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? "text-cyan-400" : "text-slate-400"
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate">{item.label}</span>
                    {typeof item.badge === "number" && item.badge > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-mono font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
                {isCollapsed &&
                  typeof item.badge === "number" &&
                  item.badge > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
                  )}
              </button>
            );
          })}
        </nav>

        {/* System Status / Phase Footer */}
        <div className="p-3 border-t border-slate-800/80">
          <div
            className={`flex items-center gap-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-medium text-slate-300 truncate">
                  Phase 1 UI Active
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  Local Mock Store
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
