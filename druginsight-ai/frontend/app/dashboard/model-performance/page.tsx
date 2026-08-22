"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/LoadingState";
import { api } from "@/lib/api";

export default function ModelPerformancePage() {
  const [metrics, setMetrics] = useState<{
    trained: boolean;
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
    roc_auc?: number;
    message?: string;
  } | null>(null);

  useEffect(() => {
    api.modelMetrics().then(setMetrics).catch(() => setMetrics({ trained: false, message: "Backend unavailable" }));
  }, []);

  if (!metrics) return <LoadingState />;

  const items = [
    { label: "Accuracy", value: metrics.accuracy },
    { label: "Precision", value: metrics.precision },
    { label: "Recall", value: metrics.recall },
    { label: "F1 Score", value: metrics.f1_score },
    { label: "ROC-AUC", value: metrics.roc_auc },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Model Performance</h1>
      {!metrics.trained ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">
            {metrics.message || "Model evaluation will appear after training."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <Card key={m.label}>
              <CardHeader>
                <CardTitle className="text-base">{m.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {m.value != null ? `${(m.value * 100).toFixed(1)}%` : "—"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-500">
        Metrics are computed on the baseline Random Forest model trained on the local research dataset.
        Not representative of clinical performance.
      </p>
    </div>
  );
}
