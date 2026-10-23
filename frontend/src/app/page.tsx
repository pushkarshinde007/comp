"use client";

import React, { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { KpiCards } from "../components/dashboard/KpiCards";
import { IncidentMapPanel } from "../components/dashboard/IncidentMapPanel";
import { PriorityQueue } from "../components/dashboard/PriorityQueue";
import { RecentReportsTable } from "../components/dashboard/RecentReportsTable";
import { ActivitySummary } from "../components/dashboard/ActivitySummary";
import { IssueSubmissionModal } from "../components/incident/IssueSubmissionModal";
import { IncidentDetailDrawer } from "../components/incident/IncidentDetailDrawer";
import { Toast, ToastMessage } from "../components/ui/Toast";
import {
  Incident,
  IncidentStatus,
  ActiveView,
  RealGeminiAnalysis,
  AuditEvent,
} from "../types/incident";
import { INITIAL_MOCK_INCIDENTS } from "../data/mockIncidents";
import { createAuditEvent } from "../lib/civicIntelligence";
import {
  MapPin,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_MOCK_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Calculate unreviewed count for badges
  const pendingReviewCount = incidents.filter(
    (inc) => inc.status === "pending_review"
  ).length;

  // Handler: Add new incident from submission modal
  const handleAddIncident = (newIncident: Incident) => {
    setIncidents((prev) => [newIncident, ...prev]);
    setToast({
      id: `toast-${Date.now()}`,
      type: "success",
      title: `Incident ${newIncident.trackingCode} Logged`,
      message: "Added to municipal triage queue in local browser state.",
    });
  };

  // Handler: Update incident status from drawer
  const handleUpdateStatus = (
    incidentId: string,
    newStatus: IncidentStatus,
    notes?: string
  ) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const prevStatus = inc.status;
          const statusEvent: AuditEvent = createAuditEvent(
            "STATUS_CHANGED",
            "Municipal Dispatcher #104",
            notes
              ? `Status changed from ${prevStatus} to ${newStatus}. Note: "${notes}"`
              : `Status changed from ${prevStatus} to ${newStatus}.`,
            prevStatus,
            newStatus
          );

          const updated: Incident = {
            ...inc,
            status: newStatus,
            reviewNotes: notes || inc.reviewNotes,
            auditTrail: [statusEvent, ...(inc.auditTrail || [])],
          };
          // Keep selected incident synchronized
          if (selectedIncident?.id === incidentId) {
            setSelectedIncident(updated);
          }
          return updated;
        }
        return inc;
      })
    );

    const statusLabels: Record<IncidentStatus, string> = {
      pending_review: "marked as Pending Review",
      verified: "Verified",
      in_progress: "marked In Progress",
      dispatched: "Dispatched to Field Crew",
      resolved: "Resolved & Closed",
      rejected: "Rejected / Marked Duplicate",
    };

    setToast({
      id: `toast-${Date.now()}`,
      type: "info",
      title: "Incident Status Updated",
      message: `Incident is now ${statusLabels[newStatus]}.`,
    });
  };

  // Handler: Attach Gemini Analysis to incident
  const handleAttachGeminiAnalysis = (
    incidentId: string,
    analysis: RealGeminiAnalysis
  ) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const aiEvent: AuditEvent = createAuditEvent(
            "AI_ANALYSIS_ATTACHED",
            `Google Gemini (${analysis.model})`,
            `Structured AI triage attached. Category: ${analysis.category}, Urgency: ${analysis.suggested_urgency}.`
          );
          const updated: Incident = {
            ...inc,
            geminiAnalysis: analysis,
            auditTrail: [aiEvent, ...(inc.auditTrail || [])],
          };
          if (selectedIncident?.id === incidentId) {
            setSelectedIncident(updated);
          }
          return updated;
        }
        return inc;
      })
    );

    setToast({
      id: `toast-${Date.now()}`,
      type: "success",
      title: "Gemini Analysis Complete",
      message: `Structured triage completed by ${analysis.model}.`,
    });
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        pendingReviewCount={pendingReviewCount}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Operational Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          activeView={activeView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          unreadNotificationsCount={pendingReviewCount}
        />

        {/* Dynamic Content Views */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* VIEW: OVERVIEW */}
          {activeView === "overview" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* KPI Metrics */}
              <KpiCards
                incidents={incidents}
                onFilterByStatus={() => setActiveView("live_issues")}
                onFilterBySeverity={() => setActiveView("review_queue")}
              />

              {/* Spatial Map & Priority Queue Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <IncidentMapPanel
                    incidents={incidents}
                    selectedIncident={selectedIncident}
                    onSelectIncident={setSelectedIncident}
                  />
                </div>
                <div>
                  <PriorityQueue
                    incidents={incidents}
                    onSelectIncident={setSelectedIncident}
                  />
                </div>
              </div>

              {/* Activity Trend Summaries */}
              <ActivitySummary incidents={incidents} />

              {/* Filterable Incident Registry Stream */}
              <RecentReportsTable
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          )}

          {/* VIEW: LIVE ISSUES */}
          {activeView === "live_issues" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Full Incident Registry Stream
                  </h2>
                  <p className="text-xs text-slate-400">
                    Search and triage all citizen-reported infrastructure issues across the municipality.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
                >
                  Submit New Issue
                </button>
              </div>

              <RecentReportsTable
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          )}

          {/* VIEW: MAP VIEW */}
          {activeView === "map_view" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <IncidentMapPanel
                incidents={incidents}
                selectedIncident={selectedIncident}
                onSelectIncident={setSelectedIncident}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>District Sector Coordinates</span>
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    Municipal sectors are partitioned into 5 operational zones. Critical alerts automatically broadcast geocoded push signals to district dispatch squads.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400" />
                    <span>GIS Roadmap (Future Extension)</span>
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    Google Maps Platform JavaScript API will render polygon municipal overlays, live heatmaps, and street view photo validation in future cloud releases.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ANALYTICS */}
          {activeView === "analytics" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <KpiCards incidents={incidents} />
              <ActivitySummary incidents={incidents} />
            </div>
          )}

          {/* VIEW: REVIEW QUEUE */}
          {activeView === "review_queue" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/30 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Authorized Review &amp; Dispatch Queue</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Items flagged as high urgency or awaiting human verification before crew dispatch.
                  </p>
                </div>
                <span className="font-mono text-xs text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-800/40">
                  {pendingReviewCount} Reports Pending
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <PriorityQueue
                    incidents={incidents}
                    onSelectIncident={setSelectedIncident}
                  />
                </div>
                <div className="lg:col-span-2">
                  <RecentReportsTable
                    incidents={incidents.filter(
                      (i) =>
                        i.status === "pending_review" ||
                        i.severity === "critical" ||
                        i.severity === "high"
                    )}
                    onSelectIncident={setSelectedIncident}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Slide-out Incident Details Drawer */}
      <IncidentDetailDrawer
        key={selectedIncident?.id || "drawer-closed"}
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onUpdateStatus={handleUpdateStatus}
        onAttachGeminiAnalysis={handleAttachGeminiAnalysis}
      />

      {/* Citizen Issue Submission Modal */}
      <IssueSubmissionModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitIncident={handleAddIncident}
        existingIncidents={incidents}
      />

      {/* Interactive Action Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
