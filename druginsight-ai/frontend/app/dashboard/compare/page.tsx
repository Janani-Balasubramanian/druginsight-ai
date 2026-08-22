"use client";

import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState } from "@/components/LoadingState";
import { api } from "@/lib/api";

export default function CompareDrugsPage() {
  const [drugs, setDrugs] = useState(["Aspirin", "Ibuprofen"]);
  const [disease, setDisease] = useState("Inflammation");
  const [result, setResult] = useState<{
    comparisons: Array<Record<string, unknown>>;
    highest_model_score: string;
    disclaimer: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateDrug(i: number, value: string) {
    const next = [...drugs];
    next[i] = value;
    setDrugs(next);
  }

  async function compare() {
    const valid = drugs.filter((d) => d.trim());
    if (valid.length < 2) {
      setError("Select at least 2 drugs");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.compare(valid, disease);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setLoading(false);
    }
  }

  const chartData =
    result?.comparisons.map((c) => ({
      drug: c.drug as string,
      score: Math.round((c.score as number) * 100),
    })) ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Compare Drugs</h1>
      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <Label>Disease context (optional)</Label>
            <Input value={disease} onChange={(e) => setDisease(e.target.value)} />
          </div>
          {drugs.map((d, i) => (
            <div key={i}>
              <Label>Drug {i + 1}</Label>
              <Input value={d} onChange={(e) => updateDrug(i, e.target.value)} />
            </div>
          ))}
          <div className="flex gap-2">
            {drugs.length < 4 && (
              <Button variant="outline" onClick={() => setDrugs([...drugs, ""])}>
                Add Drug
              </Button>
            )}
            <Button variant="accent" onClick={compare} disabled={loading}>
              Compare
            </Button>
          </div>
        </CardContent>
      </Card>
      {error && <ErrorState message={error} />}
      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                Highest model score: {result.highest_model_score}{" "}
                <span className="text-sm font-normal text-slate-500">(not best medicine)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2">Drug</th>
                      <th className="p-2">Score</th>
                      <th className="p-2">Confidence</th>
                      <th className="p-2">Targets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.comparisons.map((c) => (
                      <tr
                        key={c.drug as string}
                        className={`border-b ${c.drug === result.highest_model_score ? "bg-cyan-50" : ""}`}
                      >
                        <td className="p-2 font-medium">{c.drug as string}</td>
                        <td className="p-2">{Math.round((c.score as number) * 100)}%</td>
                        <td className="p-2 capitalize">{c.confidence as string}</td>
                        <td className="p-2">{c.target_count as number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-500">{result.disclaimer}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Score Comparison</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="drug" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#0891B2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
