"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { FeatureImportanceChart } from "@/components/FeatureImportanceChart";
import { AnalysisProgress, ErrorState } from "@/components/LoadingState";
import { api, type DiseaseResult, type PredictResponse } from "@/lib/api";

export default function DiseaseAnalysisPage() {
  const [query, setQuery] = useState("");
  const [disease, setDisease] = useState<DiseaseResult | null>(null);
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);

  async function analyze() {
    if (!query.trim()) {
      setError("Please enter a disease name");
      return;
    }
    setError("");
    setLoading(true);
    setPrediction(null);
    for (let i = 0; i < 4; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 400));
    }
    try {
      const d = await api.searchDisease(query);
      setDisease(d);
      if (d.potential_candidates[0]) {
        const pred = await api.predict(d.potential_candidates[0], d.name);
        setPrediction(pred);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
      setStep(-1);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Disease Analysis</h1>
      <Card>
        <CardContent className="flex gap-3 p-6">
          <div className="flex-1">
            <Label htmlFor="disease">Enter disease</Label>
            <Input
              id="disease"
              placeholder="e.g., Alzheimer's Disease"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button variant="accent" className="mt-6" onClick={analyze} disabled={loading}>
            Analyze
          </Button>
        </CardContent>
      </Card>
      {loading && step >= 0 && <AnalysisProgress step={step} />}
      {error && <ErrorState message={error} />}
      {disease && (
        <Card>
          <CardHeader>
            <CardTitle>{disease.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>{disease.overview}</p>
            <p><strong>Associated targets:</strong> {disease.associated_targets.join(", ")}</p>
            <p>
              <strong>Potential research candidates:</strong>{" "}
              {disease.potential_candidates.length
                ? disease.potential_candidates.join(", ")
                : "None in curated dataset"}
            </p>
            {prediction && (
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="font-medium">Computational prediction for top candidate</p>
                <ConfidenceMeter score={prediction.score} confidence={prediction.confidence} />
                <FeatureImportanceChart features={prediction.features} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
