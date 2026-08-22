"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnalysisProgress, ErrorState } from "@/components/LoadingState";
import { api, type DrugResult } from "@/lib/api";

export default function DrugSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DrugResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);

  async function search() {
    if (!query.trim()) {
      setError("Please enter a drug name");
      return;
    }
    setError("");
    setLoading(true);
    setStep(0);
    try {
      const data = await api.searchDrug(query);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
      setStep(-1);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Drug Search</h1>
      <Card>
        <CardContent className="flex gap-3 p-6">
          <div className="flex-1">
            <Label htmlFor="drug">Enter drug name</Label>
            <Input
              id="drug"
              placeholder="e.g., Aspirin"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
          </div>
          <Button variant="accent" className="mt-6" onClick={search} disabled={loading}>
            Search
          </Button>
        </CardContent>
      </Card>
      {loading && step >= 0 && <AnalysisProgress step={0} />}
      {error && <ErrorState message={error} />}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>
              {result.name}{" "}
              {result.is_demo && (
                <span className="text-sm font-normal text-amber-600">(Demo / Sample Data)</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Drug ID:</strong> {result.external_id}</p>
            <p><strong>Molecular formula:</strong> {result.molecular_formula || "—"}</p>
            <p><strong>Molecular weight:</strong> {result.molecular_weight ?? "—"}</p>
            <p><strong>SMILES:</strong> <code className="text-xs">{result.smiles || "—"}</code></p>
            <p><strong>Known targets:</strong> {result.targets.length ? result.targets.join(", ") : "—"}</p>
            <Button
              variant="accent"
              className="mt-4"
              onClick={() => router.push(`/dashboard/repurposing?drug=${encodeURIComponent(result.name)}`)}
            >
              Analyze Drug
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
