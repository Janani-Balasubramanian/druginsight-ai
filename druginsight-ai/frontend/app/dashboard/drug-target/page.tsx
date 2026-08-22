"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { ErrorState } from "@/components/LoadingState";
import { api, type PredictResponse } from "@/lib/api";

const initialNodes: Node[] = [
  { id: "drug", position: { x: 0, y: 100 }, data: { label: "Drug" }, style: { background: "#0891B2", color: "#fff", borderRadius: 8, padding: 10 } },
  { id: "protein", position: { x: 250, y: 0 }, data: { label: "Protein Target" }, style: { background: "#0F172A", color: "#fff", borderRadius: 8, padding: 10 } },
  { id: "disease", position: { x: 250, y: 200 }, data: { label: "Disease" }, style: { background: "#16A34A", color: "#fff", borderRadius: 8, padding: 10 } },
];

const initialEdges: Edge[] = [
  { id: "e-dt", source: "drug", target: "protein", label: "Drug–Target" },
  { id: "e-dd", source: "drug", target: "disease", label: "Drug–Disease" },
  { id: "e-td", source: "protein", target: "disease", label: "Target–Disease" },
];

export default function DrugTargetPage() {
  const [drug, setDrug] = useState("Aspirin");
  const [disease, setDisease] = useState("Cardiovascular Disease");
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  async function analyze() {
    setError("");
    setLoading(true);
    try {
      const res = await api.predict(drug, disease);
      setResult(res);
      setNodes([
        { ...initialNodes[0], data: { label: drug } },
        { ...initialNodes[1], data: { label: res.target } },
        { ...initialNodes[2], data: { label: disease } },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Drug-Target Analysis</h1>
      <p className="text-sm text-slate-600">
        Interactive flow: Drug → Molecular Features → AI Model → Protein Target → Interaction Probability
      </p>
      <Card>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
          <div>
            <Label htmlFor="drug">Drug</Label>
            <Input id="drug" value={drug} onChange={(e) => setDrug(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="disease">Disease</Label>
            <Input id="disease" value={disease} onChange={(e) => setDisease(e.target.value)} />
          </div>
          <Button variant="accent" className="mt-6" onClick={analyze} disabled={loading}>
            Analyze Interaction
          </Button>
        </CardContent>
      </Card>
      {error && <ErrorState message={error} />}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-[400px]">
          <CardHeader>
            <CardTitle>Drug–Target–Disease Network</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </CardContent>
        </Card>
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Interaction Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p><strong>Drug:</strong> {drug}</p>
              <p><strong>Target:</strong> {result.target}</p>
              <p><strong>Interaction score:</strong> {Math.round(result.score * 100)}%</p>
              <p><strong>Confidence:</strong> <span className="capitalize">{result.confidence}</span></p>
              <ConfidenceMeter score={result.score} confidence={result.confidence} />
              <p className="text-xs text-slate-500">Computational prediction — not clinical evidence.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
