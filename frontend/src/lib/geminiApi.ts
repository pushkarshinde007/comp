import { RealGeminiAnalysis } from "../types/incident";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export interface AnalyzeIssueParams {
  description?: string;
  imageFile?: File | Blob | null;
  categoryHint?: string;
  locationLabel?: string;
}

export interface AnalyzeIssueSuccessResult {
  success: true;
  analysis: RealGeminiAnalysis;
}

export interface AnalyzeIssueErrorResult {
  success: false;
  status: "unconfigured" | "error" | "network_error";
  message: string;
  requestId?: string;
}

export type AnalyzeIssueResult =
  | AnalyzeIssueSuccessResult
  | AnalyzeIssueErrorResult;

export async function requestGeminiAnalysis(
  params: AnalyzeIssueParams
): Promise<AnalyzeIssueResult> {
  const formData = new FormData();

  if (params.description && params.description.trim()) {
    formData.append("description", params.description.trim());
  }

  if (params.categoryHint && params.categoryHint.trim()) {
    formData.append("category_hint", params.categoryHint.trim());
  }

  if (params.locationLabel && params.locationLabel.trim()) {
    formData.append("location_label", params.locationLabel.trim());
  }

  if (params.imageFile) {
    formData.append("image", params.imageFile);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s client timeout

    const response = await fetch(`${API_BASE_URL}/api/v1/analyze-issue`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const detail = data?.detail;
      const statusType =
        typeof detail === "object" && detail?.status
          ? detail.status
          : response.status === 503
          ? "unconfigured"
          : "error";

      const message =
        typeof detail === "object" && detail?.message
          ? detail.message
          : typeof detail === "string"
          ? detail
          : `AI analysis service failed (HTTP ${response.status}).`;

      return {
        success: false,
        status: statusType as "unconfigured" | "error",
        message,
        requestId: typeof detail === "object" ? detail?.request_id : undefined,
      };
    }

    if (data?.status === "completed" && data?.analysis) {
      const realAnalysis: RealGeminiAnalysis = {
        category: data.analysis.category,
        summary: data.analysis.summary,
        observed_evidence: data.analysis.observed_evidence || [],
        uncertainty_notes: data.analysis.uncertainty_notes,
        suggested_urgency: data.analysis.suggested_urgency,
        recommended_action: data.analysis.recommended_action,
        evidence_basis: data.analysis.evidence_basis,
        analyzedAt: new Date().toISOString(),
        model: data.model || "gemini-2.5-flash",
        requestId: data.request_id,
      };

      return {
        success: true,
        analysis: realAnalysis,
      };
    }

    return {
      success: false,
      status: "error",
      message: data?.message || "Invalid or incomplete response from AI engine.",
      requestId: data?.request_id,
    };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        success: false,
        status: "error",
        message: "Gemini analysis request timed out. Please retry.",
      };
    }

    return {
      success: false,
      status: "network_error",
      message:
        "Unable to communicate with CivicSignal backend service. Ensure FastAPI server is running on http://127.0.0.1:8000.",
    };
  }
}
