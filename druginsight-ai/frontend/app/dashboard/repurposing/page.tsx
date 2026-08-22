"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { FeatureImportanceChart } from "@/components/FeatureImportanceChart";
import { AnalysisProgress, ErrorState } from "@/components/LoadingState";
import { api, type PredictResponse } from "@/lib/api";
import { formatPercent } from "@/lib/utils";

function RepurposingContent() {
  const params = useSearchParams();
  const [disease, setDisease] = useState("");
  const [drug, setDrug] = useState(params.get("drug") || "");
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);

  async function runAnalysis() {
    if (!disease.trim()) {
      setError("Disease is required");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    for (let i = 0; i < 4; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 500));
    }
    try {
      const res = await api.repurpose(disease, drug || undefined);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
      setStep(-1);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Drug Repurposing Analysis</h1>
      <Card>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="disease">Disease (required)</Label>
            <Input
              id="disease"
              placeholder="Alzheimer's Disease"
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="drug">Drug (optional)</Label>
            <Input
              id="drug"
              placeholder="Donepezil"
              value={drug}
              onChange={(e) => setDrug(e.target.value)}
            />
          </div>
          <Button variant="accent" className="sm:col-span-2" onClick={runAnalysis} disabled={loading}>
            Run AI Analysis
          </Button>
        </CardContent>
      </Card>
      {loading && step >= 0 && <AnalysisProgress step={step} />}
      {error && <ErrorState message={error} />}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>
              Repurposing Analysis{" "}
              {result.is_demo && (
                <span className="text-sm font-normal text-amber-600">(Demo / Sample Data)</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p><strong>Disease:</strong> {disease}</p>
              <p><strong>Candidate Drug:</strong> {drug || "Auto-selected"}</p>
              <p><strong>Prediction Score:</strong> {formatPercent(result.score)}</p>
              <p><strong>Confidence:</strong> <span className="capitalize">{result.confidence}</span></p>
              <p><strong>Potential Target:</strong> {result.target}</p>
              <p className="text-amber-700"><strong>Status:</strong> Computational prediction</p>
            </div>
            <ConfidenceMeter score={result.score} confidence={result.confidence} />
            <FeatureImportanceChart features={result.features} />
            <p className="text-xs text-slate-500">{result.disclaimer}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function RepurposingPage() {
  return (
    <Suspense>
      <RepurposingContent />
    </Suspense>
  );
}
