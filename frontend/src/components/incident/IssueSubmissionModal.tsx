"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Sparkles,
  Info,
  BrainCircuit,
  ShieldCheck,
  Check,
} from "lucide-react";
import {
  Incident,
  IncidentCategory,
  IncidentSeverity,
  RealGeminiAnalysis,
} from "../../types/incident";
import { CATEGORY_DEFINITIONS } from "../../data/mockIncidents";
import { requestGeminiAnalysis } from "../../lib/geminiApi";

interface IssueSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitIncident: (newIncident: Incident) => void;
}

export const IssueSubmissionModal: React.FC<IssueSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmitIncident,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<IncidentCategory>("road_hazard");
  const [severity, setSeverity] = useState<IncidentSeverity>("medium");
  const [locationLabel, setLocationLabel] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Gemini AI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState<RealGeminiAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [aiApplied, setAiApplied] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isSubmitting && !isAnalyzing) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, isAnalyzing, onClose]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image must be under 5MB in size.",
        }));
        return;
      }
      setSelectedFile(file);
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.image;
        return next;
      });
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setImageFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyzeWithGemini = async () => {
    setAnalysisError(null);

    if (!description.trim() && !selectedFile) {
      setErrors((prev) => ({
        ...prev,
        description: "Please enter a description or attach a photo before running Gemini analysis.",
      }));
      return;
    }

    setIsAnalyzing(true);

    const result = await requestGeminiAnalysis({
      description: description.trim() || undefined,
      imageFile: selectedFile,
      categoryHint: category,
      locationLabel: locationLabel.trim() || undefined,
    });

    setIsAnalyzing(false);

    if (result.success) {
      setGeminiAnalysis(result.analysis);
      setAiApplied(false);
    } else {
      setAnalysisError(result.message);
    }
  };

  const handleApplyAiSuggestions = () => {
    if (!geminiAnalysis) return;

    // Map Gemini category to UI domain category
    const categoryMapping: Record<string, IncidentCategory> = {
      pothole: "road_hazard",
      garbage: "sanitation_dumping",
      streetlight: "electrical_lighting",
      water_leak: "water_utility",
      other: "public_safety",
    };

    const mappedCategory = categoryMapping[geminiAnalysis.category] || "public_safety";
    setCategory(mappedCategory);
    setSeverity(geminiAnalysis.suggested_urgency);
    if (!title.trim() && geminiAnalysis.summary) {
      setTitle(geminiAnalysis.summary.slice(0, 100));
    }
    setAiApplied(true);
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) {
      errs.title = "Incident title or brief summary is required.";
    } else if (title.trim().length < 5) {
      errs.title = "Title must be at least 5 characters.";
    }

    if (!locationLabel.trim()) {
      errs.location = "Specific municipal address or intersection is required.";
    }

    if (!description.trim()) {
      errs.description = "Detailed incident description is required.";
    } else if (description.trim().length < 15) {
      errs.description =
        "Description must be at least 15 characters to assist responders.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const codeNum = Math.floor(1000 + Math.random() * 9000);
      const newInc: Incident = {
        id: `inc-${Date.now()}`,
        trackingCode: `CIV-${codeNum}`,
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        status: "pending_review",
        locationLabel: locationLabel.trim(),
        coordinates: {
          x: Math.floor(20 + Math.random() * 60),
          y: Math.floor(20 + Math.random() * 60),
          district: "District 2 - Central",
        },
        reportedAt: new Date().toISOString(),
        reportedBy: "Public Citizen (Web Client)",
        upvotes: 1,
        imageUrl: imagePreview || undefined,
        geminiAnalysis: geminiAnalysis || undefined,
      };

      onSubmitIncident(newInc);
      setIsSubmitting(false);
      setSubmittedSuccess(true);

      setTimeout(() => {
        setSubmittedSuccess(false);
        // Reset form
        setTitle("");
        setLocationLabel("");
        setDescription("");
        removeImage();
        setGeminiAnalysis(null);
        setAnalysisError(null);
        setAiApplied(false);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div>
            <h2
              id="modal-title"
              className="text-base font-semibold text-white tracking-tight flex items-center gap-2"
            >
              <span>Report a Civic Infrastructure Issue</span>
              <span className="text-[10px] font-mono uppercase bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/40">
                Gemini Enabled
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit an operational report with optional automated Gemini AI triage
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isAnalyzing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              Incident Submitted Successfully!
            </h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Your report has been injected into the live queue and assigned for municipal review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Title Input */}
            <div>
              <label
                htmlFor="incident-title"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Incident Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="incident-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Deep Pothole Damaging Rims on 5th Ave"
                className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 ${
                  errors.title
                    ? "border-rose-500 focus:ring-rose-500"
                    : "border-slate-800 focus:border-cyan-500 focus:ring-cyan-500"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.title}
                </p>
              )}
            </div>

            {/* Category & Initial Severity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="incident-category"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Domain Category <span className="text-rose-400">*</span>
                </label>
                <select
                  id="incident-category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as IncidentCategory)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {Object.entries(CATEGORY_DEFINITIONS).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="incident-severity"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Urgency / Severity Level
                </label>
                <select
                  id="incident-severity"
                  value={severity}
                  onChange={(e) =>
                    setSeverity(e.target.value as IncidentSeverity)
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="critical">Critical (Immediate Danger)</option>
                  <option value="high">High (Traffic/Property Risk)</option>
                  <option value="medium">Medium (Moderate Hazard)</option>
                  <option value="low">Low (Cosmetic/Scheduled)</option>
                </select>
              </div>
            </div>

            {/* Location Input */}
            <div>
              <label
                htmlFor="incident-location"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Exact Location / Cross-Street <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="incident-location"
                  type="text"
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                  placeholder="e.g., Corner of Grand Ave &amp; 8th St"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 ${
                    errors.location
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-slate-800 focus:border-cyan-500 focus:ring-cyan-500"
                  }`}
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.location}
                </p>
              )}
            </div>

            {/* Description Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="incident-desc"
                  className="text-xs font-medium text-slate-300"
                >
                  Detailed Observation <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {description.length}/4000
                </span>
              </div>
              <textarea
                id="incident-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the hazard size, observed impact on traffic or pedestrians, and any immediate safety hazards..."
                className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 ${
                  errors.description
                    ? "border-rose-500 focus:ring-rose-500"
                    : "border-slate-800 focus:border-cyan-500 focus:ring-cyan-500"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.description}
                </p>
              )}
            </div>

            {/* Photo Attachment */}
            <div>
              <span className="block text-xs font-medium text-slate-300 mb-1">
                Visual Evidence (Optional, max 5MB)
              </span>

              {imagePreview ? (
                <div className="relative rounded-lg border border-slate-700 bg-slate-900 p-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Upload preview"
                    className="w-16 h-16 object-cover rounded-md border border-slate-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-200 truncate">
                      {imageFileName || "Attached Evidence"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Ready for Gemini multimodal analysis
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-lg p-3 text-center cursor-pointer transition-colors bg-slate-900/40"
                >
                  <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-300">
                    Click to attach photo evidence
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                    aria-label="Upload photo evidence"
                  />
                </div>
              )}
              {errors.image && (
                <p className="mt-1 text-xs text-rose-400">{errors.image}</p>
              )}
            </div>

            {/* Gemini Analysis Action Bar */}
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Google Gemini AI Assistance
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Analyze description and image before submitting
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyzeWithGemini}
                  disabled={isAnalyzing || isSubmitting}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-medium transition-all shadow-sm shrink-0"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Analyzing with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                      <span>Analyze with Gemini</span>
                    </>
                  )}
                </button>
              </div>

              {/* Gemini Error / Unconfigured Message */}
              {analysisError && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/50 text-xs text-amber-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-300">
                      Gemini Analysis Notice
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      {analysisError}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Your entered report remains intact. You may submit manually without AI analysis.
                    </p>
                  </div>
                </div>
              )}

              {/* Structured Gemini Analysis Results Card */}
              {geminiAnalysis && (
                <div className="p-3.5 rounded-lg bg-slate-950 border border-cyan-500/40 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-white">
                        Gemini Structured Triage
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      {geminiAnalysis.model}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">AI Summary:</span>
                    <p className="text-slate-200 font-medium mt-0.5">
                      {geminiAnalysis.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Identified Category:</span>
                      <span className="text-cyan-300 font-bold uppercase">
                        {geminiAnalysis.category.replace("_", " ")}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Suggested Urgency:</span>
                      <span className="text-amber-400 font-bold uppercase">
                        {geminiAnalysis.suggested_urgency}
                      </span>
                    </div>
                  </div>

                  {geminiAnalysis.observed_evidence.length > 0 && (
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">
                        Observed Evidence:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {geminiAnalysis.observed_evidence.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px]">
                    <span className="text-slate-400 font-semibold block">
                      Uncertainty / Limitations:
                    </span>
                    <p className="text-slate-300 mt-0.5">
                      {geminiAnalysis.uncertainty_notes}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Basis: {geminiAnalysis.evidence_basis}
                    </span>
                    {!aiApplied ? (
                      <button
                        type="button"
                        onClick={handleApplyAiSuggestions}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-medium text-[11px] transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>Apply AI Category &amp; Urgency</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Suggestions Applied
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isAnalyzing}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isAnalyzing}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-medium shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Submit to Ops Queue</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
