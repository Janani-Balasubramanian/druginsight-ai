"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FeatureImportanceChart } from "@/components/FeatureImportanceChart";
import { AnalysisProgress, ErrorState } from "@/components/LoadingState";
import { api, type FeatureContribution } from "@/lib/api";

export default function ExplainableAIPage() {
  const [drug, setDrug] = useState("Donepezil");
  const [disease, setDisease] = useState("Alzheimer's Disease");
  const [features, setFeatures] = useState<FeatureContribution[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);

  async function explain() {
    setError("");
    setLoading(true);
    for (let i = 0; i < 4; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 400));
    }
    try {
      const res = await api.explain(drug, disease);
      setFeatures(res.features);
      setSummary(res.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Explanation failed");
    } finally {
      setLoading(false);
      setStep(-1);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Explainable AI</h1>
      <Card>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="drug">Drug</Label>
            <Input id="drug" value={drug} onChange={(e) => setDrug(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="disease">Disease</Label>
            <Input id="disease" value={disease} onChange={(e) => setDisease(e.target.value)} />
          </div>
          <Button variant="accent" className="sm:col-span-2" onClick={explain} disabled={loading}>
            Generate SHAP Explanation
          </Button>
        </CardContent>
      </Card>
      {loading && step >= 0 && <AnalysisProgress step={step} />}
      {error && <ErrorState message={error} />}
      {features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feature Importance</CardTitle>
          </CardHeader>
          <CardContent>
            <FeatureImportanceChart features={features} />
            <p className="mt-4 text-sm text-slate-600">{summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
