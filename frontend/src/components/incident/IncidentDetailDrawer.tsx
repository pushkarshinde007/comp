"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  MapPin,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  XCircle,
  Truck,
  BrainCircuit,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Incident, IncidentStatus, RealGeminiAnalysis } from "../../types/incident";
import { SeverityBadge, StatusBadge } from "../ui/Badge";
import { requestGeminiAnalysis } from "../../lib/geminiApi";

interface IncidentDetailDrawerProps {
  incident: Incident | null;
  onClose: () => void;
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus, notes?: string) => void;
  onAttachGeminiAnalysis?: (incidentId: string, analysis: RealGeminiAnalysis) => void;
}

export const IncidentDetailDrawer: React.FC<IncidentDetailDrawerProps> = ({
  incident,
  onClose,
  onUpdateStatus,
  onAttachGeminiAnalysis,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && incident) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [incident, onClose]);

  if (!incident) return null;

  const currentGeminiAnalysis = incident.geminiAnalysis;

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    const result = await requestGeminiAnalysis({
      description: incident.description,
      categoryHint: incident.category,
      locationLabel: incident.locationLabel,
    });

    setIsAnalyzing(false);

    if (result.success) {
      onAttachGeminiAnalysis?.(incident.id, result.analysis);
    } else {
      setAnalysisError(result.message);
    }
  };

  const formattedDate = new Date(incident.reportedAt).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <aside
        className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[520px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-labelledby="drawer-title"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
              {incident.trackingCode}
            </span>
            <SeverityBadge severity={incident.severity} size="sm" />
            <StatusBadge status={incident.status} size="sm" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close details drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs sm:text-sm">
          {/* Incident Title & Meta */}
          <div>
            <h2
              id="drawer-title"
              className="text-lg font-bold text-white tracking-tight leading-snug"
            >
              {incident.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                {incident.reportedBy}
              </span>
            </div>
          </div>

          {/* Location Box */}
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Jurisdiction &amp; Location
            </span>
            <div className="flex items-start gap-2 text-slate-200 font-medium">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p>{incident.locationLabel}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Sector: {incident.coordinates.district} &bull; Coordinates: [
                  {incident.coordinates.x.toFixed(1)},{" "}
                  {incident.coordinates.y.toFixed(1)}]
                </p>
              </div>
            </div>
          </div>

          {/* Description & Narrative */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Citizen Report Description
            </span>
            <p className="text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
              {incident.description}
            </p>
          </div>

          {/* Image Evidence (if present) */}
          {incident.imageUrl && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Visual Evidence
              </span>
              <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={incident.imageUrl}
                  alt={`Evidence for ${incident.title}`}
                  className="w-full max-h-56 object-cover"
                />
              </div>
            </div>
          )}

          {/* Google Gemini AI Structured Analysis Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-cyan-500/40 space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-800/30 pb-2">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white text-xs">
                  Gemini Structured Triage Analysis
                </span>
              </div>

              {currentGeminiAnalysis ? (
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Live Analysis
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white font-medium text-[11px] transition-colors"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Calling Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-cyan-200" />
                      <span>Analyze with Gemini</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {analysisError && (
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-300">Analysis Notice</p>
                  <p className="text-slate-300 mt-0.5">{analysisError}</p>
                </div>
              </div>
            )}

            {currentGeminiAnalysis ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 font-mono uppercase block">
                    AI Issue Summary:
                  </span>
                  <p className="text-slate-100 font-medium mt-0.5">
                    {currentGeminiAnalysis.summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">Classified Category:</span>
                    <span className="text-cyan-300 font-bold uppercase">
                      {currentGeminiAnalysis.category.replace("_", " ")}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">Suggested Urgency:</span>
                    <span className="text-amber-400 font-bold uppercase">
                      {currentGeminiAnalysis.suggested_urgency}
                    </span>
                  </div>
                </div>

                {currentGeminiAnalysis.observed_evidence.length > 0 && (
                  <div>
                    <span className="text-[11px] text-slate-400 font-mono uppercase block mb-1">
                      Observed Evidence:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                      {currentGeminiAnalysis.observed_evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 font-semibold block">
                    Uncertainty &amp; Limitations:
                  </span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    {currentGeminiAnalysis.uncertainty_notes}
                  </p>
                </div>

                <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-800/40 text-[11px]">
                  <span className="text-cyan-300 font-semibold block">
                    Recommended Action:
                  </span>
                  <p className="text-slate-200 mt-0.5">
                    {currentGeminiAnalysis.recommended_action}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-mono">
                  <span>Basis: {currentGeminiAnalysis.evidence_basis}</span>
                  <span>Model: {currentGeminiAnalysis.model}</span>
                </div>
              </div>
            ) : (
              !analysisError && (
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-400">
                  <p className="text-[11px] leading-relaxed">
                    Click <strong>Analyze with Gemini</strong> above to submit this report&apos;s description and location to Google Gemini for real-time structured classification, evidence extraction, and triage recommendations.
                  </p>
                </div>
              )
            )}
          </div>

          {/* Assigned Department & Review Notes */}
          {incident.assignedDepartment && (
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Assigned Responding Unit
              </span>
              <p className="font-medium text-slate-200">
                {incident.assignedDepartment}
              </p>
              {incident.reviewNotes && (
                <p className="text-xs text-slate-400 italic mt-1">
                  &ldquo;{incident.reviewNotes}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>

        {/* Drawer Review Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-mono uppercase tracking-wider">
              Triage &amp; Status Actions
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Deterministic Human Review
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                onUpdateStatus(
                  incident.id,
                  "dispatched",
                  "Verified hazard and dispatched field team."
                )
              }
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Verify &amp; Dispatch</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateStatus(
                  incident.id,
                  "in_progress",
                  "Repair crew on-site and active."
                )
              }
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>In Progress</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateStatus(
                  incident.id,
                  "resolved",
                  "Municipal work order complete."
                )
              }
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolve</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateStatus(
                  incident.id,
                  "rejected",
                  "Marked as duplicate or non-actionable."
                )
              }
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-300 font-medium text-xs border border-slate-700 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject / Duplicate</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-500 text-center font-mono">
            Safety Guardrail: AI suggestions cannot directly approve or resolve incidents.
          </p>
        </div>
      </aside>
    </>
  );
};
