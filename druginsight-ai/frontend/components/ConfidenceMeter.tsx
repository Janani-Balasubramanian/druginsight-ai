"use client";

import { formatPercent } from "@/lib/utils";

type Props = {
  score: number;
  confidence: "low" | "medium" | "high";
};

const COLORS = {
  low: "text-warning",
  medium: "text-accent",
  high: "text-success",
};

export function ConfidenceMeter({ score, confidence }: Props) {
  const pct = Math.round(score * 100);
  return (
    <div className="space-y-2" aria-label={`Confidence: ${confidence}, score ${pct}%`}>
      <div className="flex justify-between text-sm">
        <span className="font-medium capitalize">{confidence} confidence</span>
        <span className="font-semibold">{formatPercent(score)}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-accent to-cyan-400 transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs font-medium capitalize ${COLORS[confidence]}`}>
        Computational prediction — not clinical evidence
      </p>
    </div>
  );
}
