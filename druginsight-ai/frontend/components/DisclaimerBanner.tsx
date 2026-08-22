"use client";

import { AlertTriangle } from "lucide-react";

export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 ${
        compact ? "p-2 text-xs" : "p-3 text-sm"
      }`}
      role="note"
      aria-label="Research disclaimer"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>
        DrugInsight AI is an academic research prototype. Predictions are computational and should
        not be interpreted as medical advice, diagnosis, or treatment recommendations.
      </p>
    </div>
  );
}
