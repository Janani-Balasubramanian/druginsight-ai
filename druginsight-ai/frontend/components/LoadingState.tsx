"use client";

import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500" role="status">
      <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function AnalysisProgress({ step }: { step: number }) {
  const steps = [
    "Fetching biomedical data...",
    "Processing molecular features...",
    "Running AI model...",
    "Generating explanation...",
  ];
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-sm font-medium text-primary">Analysis in progress</p>
      <ol className="space-y-2">
        {steps.map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-2 text-sm ${
              i <= step ? "text-accent" : "text-slate-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                i < step ? "bg-success" : i === step ? "bg-accent animate-pulse" : "bg-slate-200"
              }`}
            />
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      role="alert"
    >
      {message}
    </div>
  );
}
