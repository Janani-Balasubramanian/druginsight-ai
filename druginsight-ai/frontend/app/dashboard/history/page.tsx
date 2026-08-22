"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingState, ErrorState } from "@/components/LoadingState";
import { api, type HistoryItem } from "@/lib/api";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      setItems(await api.history());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    await api.deleteHistory(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const filtered = items
    .filter(
      (i) =>
        i.drug.toLowerCase().includes(filter.toLowerCase()) ||
        i.disease.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (loading) return <LoadingState message="Loading prediction history..." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Prediction History</h1>
      <Input
        placeholder="Search by drug or disease..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        aria-label="Filter history"
      />
      {error && <ErrorState message={error} />}
      <Card>
        <CardHeader>
          <CardTitle>Analyses ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500">No predictions saved yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Date</th>
                    <th className="p-2">Drug</th>
                    <th className="p-2">Disease</th>
                    <th className="p-2">Score</th>
                    <th className="p-2">Confidence</th>
                    <th className="p-2">Status</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((i) => (
                    <tr key={i.id} className="border-b">
                      <td className="p-2">{new Date(i.created_at).toLocaleDateString()}</td>
                      <td className="p-2">{i.drug}</td>
                      <td className="p-2">{i.disease}</td>
                      <td className="p-2">{Math.round(i.score * 100)}%</td>
                      <td className="p-2 capitalize">{i.confidence}</td>
                      <td className="p-2">{i.status}</td>
                      <td className="p-2">
                        <Button variant="ghost" size="icon" onClick={() => remove(i.id)} aria-label="Delete">
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
