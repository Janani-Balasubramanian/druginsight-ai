"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FeatureContribution } from "@/lib/api";

type Props = {
  features: FeatureContribution[];
  title?: string;
};

export function FeatureImportanceChart({
  features,
  title = "Why did the model make this prediction?",
}: Props) {
  const data = features.map((f) => ({
    name: f.feature,
    contribution: f.contribution,
  }));

  return (
    <div className="h-64 w-full">
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="contribution" fill="#0891B2" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
