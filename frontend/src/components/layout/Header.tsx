"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  User,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { ActiveView } from "../../types/incident";

interface HeaderProps {
  activeView: ActiveView;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleMobileMenu: () => void;
  onOpenReportModal: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
  onOpenReportModal,
  unreadNotificationsCount = 3,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const viewTitles: Record<ActiveView, { title: string; subtitle: string }> = {
    overview: {
      title: "Municipal Operational Overview",
      subtitle: "Real-time intake stream & regional incident posture",
    },
    live_issues: {
      title: "Live Incident Directory",
      subtitle: "Filter, search, and monitor all active citizen submissions",
    },
    map_view: {
      title: "City Grid Spatial Density",
      subtitle: "Simulated municipal district coordinates & clusters",
    },
    analytics: {
      title: "Category & Resolution Analytics",
      subtitle: "SLA benchmarks and issue distribution statistics",
    },
    review_queue: {
      title: "Triage & Review Queue",
      subtitle: "Pending verification, priority assignment, and dispatch",
    },
  };

  const currentView = viewTitles[activeView];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Left: Mobile hamburger & View Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="flex lg:hidden items-center justify-center w-9 h-9 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800"
          aria-label="Open sidebar navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
            {currentView.title}
          </h1>
          <p className="text-[11px] text-slate-400 font-mono hidden md:block truncate">
            {currentView.subtitle}
          </p>
        </div>
      </div>

      {/* Center/Right: Search bar & Utility Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Universal Search Bar */}
        <div className="relative w-36 sm:w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reports by ID, street, or title..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            aria-label="Search incident reports"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>

        {/* Quick Report CTA on tablet+ */}
        <button
          type="button"
          onClick={onOpenReportModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span>New Report</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80 transition-colors"
            aria-label="View system notifications"
            aria-expanded={showNotifications}
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl p-4 z-50 text-xs"
              role="region"
              aria-label="Notifications Panel"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                <span className="font-semibold text-slate-200 text-sm">
                  Operations Notifications
                </span>
                <span className="font-mono text-[11px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  {unreadNotificationsCount} New
                </span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60 flex items-start gap-2.5">
                  <div className="p-1 rounded bg-rose-500/10 text-rose-400 shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">
                      High Priority Incident CIV-8921 Dispatched
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Water works response team arrived at 4th &amp; Market St.
                    </p>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-mono">
                      <Clock className="w-3 h-3" /> 14m ago
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60 flex items-start gap-2.5">
                  <div className="p-1 rounded bg-amber-500/10 text-amber-400 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">
                      Triage Queue Awaiting Verification
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      2 unverified hazardous electrical reports in Northgate.
                    </p>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-mono">
                      <Clock className="w-3 h-3" /> 45m ago
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60 flex items-start gap-2.5">
                  <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">
                      Incident CIV-8948 Closed
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Sunset Park playground repairs verified and certified.
                    </p>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-mono">
                      <Clock className="w-3 h-3" /> 1h ago
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 text-center">
                <span className="text-[11px] text-slate-500 font-mono">
                  All alerts generated from local mock stream
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800/80 transition-colors"
            aria-label="User Profile and Role Menu"
            aria-expanded={showProfileMenu}
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-cyan-950 text-cyan-300 font-mono text-xs font-bold border border-cyan-800/40">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium hidden md:block text-slate-200">
              Staff Reviewer #7
            </span>
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl p-3 z-50 text-xs"
              role="region"
              aria-label="Profile and Session Information"
            >
              <div className="pb-2 border-b border-slate-800 mb-2">
                <p className="font-semibold text-slate-200">
                  Municipal Ops Team
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  reviewer-07@civicsignal.demo
                </p>
              </div>
              <div className="space-y-1.5 text-slate-300 py-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Environment:</span>
                  <span className="font-mono text-cyan-400">Phase 1 Mock</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Jurisdiction:</span>
                  <span className="font-mono text-slate-300">
                    District 1–5 Central
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Access Level:</span>
                  <span className="font-mono text-emerald-400">
                    Authorized Triage
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                Authentication and Firebase integration reserved for Phase 2.
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
