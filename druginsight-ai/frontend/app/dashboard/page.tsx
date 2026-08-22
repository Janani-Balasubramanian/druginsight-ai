"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Search } from "lucide-react";
import { api, getStoredUser, type HistoryItem } from "@/lib/api";
import { getGreeting } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/LoadingState";

const PIE_COLORS = ["#16A34A", "#D97706", "#DC2626"];

export default function DashboardPage() {
  const user = getStoredUser();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.history()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const high = history.filter((h) => h.confidence === "high").length;
  const medium = history.filter((h) => h.confidence === "medium").length;
  const low = history.filter((h) => h.confidence === "low").length;
  const distData = [
    { name: "High", value: high || 1 },
    { name: "Medium", value: medium || 1 },
    { name: "Low", value: low || 1 },
  ];

  const drugCounts: Record<string, number> = {};
  history.forEach((h) => {
    drugCounts[h.drug] = (drugCounts[h.drug] || 0) + 1;
  });
  const topDrugs = Object.entries(drugCounts)
    .map(([drug, count]) => ({ drug, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (loading) return <LoadingState message="Loading dashboard..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-primary">
          {getGreeting()}, {user?.name?.split(" ")[0] || "Researcher"}
        </h1>
        <div className="relative mt-4 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-10" placeholder="Search a drug or disease..." aria-label="Search" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Searches", value: history.length || "—" },
          { label: "Predictions Generated", value: history.length || "—" },
          { label: "Drugs Analyzed", value: Object.keys(drugCounts).length || "—" },
          { label: "Model Confidence", value: history.length ? "See charts" : "Demo Data" },
        ].map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="mt-1 text-2xl font-bold text-primary">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prediction Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">No predictions yet — run an analysis to populate.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {distData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">No recent searches.</p>
            ) : (
              <ul className="space-y-2">
                {history.slice(0, 5).map((h) => (
                  <li key={h.id} className="flex justify-between text-sm">
                    <span>
                      {h.drug} → {h.disease}
                    </span>
                    <span className="text-slate-500">{Math.round(h.score * 100)}%</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Analyzed Drugs</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {topDrugs.length === 0 ? (
              <p className="text-sm text-slate-500">Demo Data — analyze drugs to populate.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDrugs}>
                  <XAxis dataKey="drug" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0891B2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              View detailed metrics on the{" "}
              <Link href="/dashboard/model-performance" className="text-accent underline">
                Model Performance
              </Link>{" "}
              page. Metrics appear after model training.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
