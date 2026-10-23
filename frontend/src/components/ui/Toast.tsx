"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "info" | "warning";
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
  };

  const borders = {
    success: "border-emerald-500/40 bg-emerald-950/90",
    warning: "border-amber-500/40 bg-amber-950/90",
    info: "border-cyan-500/40 bg-slate-950/95",
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`p-3.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 text-xs ${borders[toast.type]}`}
        role="alert"
      >
        <div className="mt-0.5">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white tracking-tight">{toast.title}</p>
          {toast.message && (
            <p className="text-slate-300 mt-0.5 leading-normal">
              {toast.message}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
