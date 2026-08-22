const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type User = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type FeatureContribution = {
  feature: string;
  contribution: number;
};

export type PredictResponse = {
  prediction: string;
  score: number;
  confidence: "low" | "medium" | "high";
  target: string;
  features: FeatureContribution[];
  is_demo: boolean;
  disclaimer: string;
};

export type DrugResult = {
  name: string;
  external_id: string;
  molecular_formula?: string;
  molecular_weight?: number;
  smiles?: string;
  targets: string[];
  bioactivity?: Record<string, unknown>;
  is_demo: boolean;
};

export type DiseaseResult = {
  name: string;
  overview: string;
  associated_targets: string[];
  potential_candidates: string[];
  is_demo: boolean;
};

export type HistoryItem = {
  id: string;
  drug: string;
  disease: string;
  prediction: string;
  score: number;
  confidence: string;
  target: string;
  status: string;
  created_at: string;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("druginsight_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  register: (data: { name: string; email: string; password: string; confirm_password: string }) =>
    request<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
  searchDrug: (q: string) => request<DrugResult>(`/api/drugs/search?q=${encodeURIComponent(q)}`),
  searchDisease: (q: string) =>
    request<DiseaseResult>(`/api/diseases/search?q=${encodeURIComponent(q)}`),
  predict: (drug: string, disease: string) =>
    request<PredictResponse>(
      "/api/predict",
      { method: "POST", body: JSON.stringify({ drug, disease }) },
      true
    ),
  repurpose: (disease: string, drug?: string) =>
    request<PredictResponse>(
      "/api/repurpose",
      { method: "POST", body: JSON.stringify({ disease, drug }) },
      true
    ),
  explain: (drug: string, disease: string) =>
    request<{ features: FeatureContribution[]; summary: string }>(
      "/api/explain",
      { method: "POST", body: JSON.stringify({ drug, disease }) },
      true
    ),
  compare: (drugs: string[], disease?: string) =>
    request<{
      comparisons: Array<Record<string, unknown>>;
      highest_model_score: string;
      disclaimer: string;
    }>(
      "/api/compare",
      { method: "POST", body: JSON.stringify({ drugs, disease }) },
      true
    ),
  history: () => request<HistoryItem[]>("/api/history", {}, true),
  deleteHistory: (id: string) =>
    request<{ message: string }>(`/api/history/${id}`, { method: "DELETE" }, true),
  modelMetrics: () =>
    request<{
      trained: boolean;
      accuracy?: number;
      precision?: number;
      recall?: number;
      f1_score?: number;
      roc_auc?: number;
      message?: string;
    }>("/api/model/metrics"),
};

export function saveAuth(token: string, user: User) {
  localStorage.setItem("druginsight_token", token);
  localStorage.setItem("druginsight_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("druginsight_token");
  localStorage.removeItem("druginsight_user");
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("druginsight_user");
  return raw ? JSON.parse(raw) : null;
}

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("druginsight_demo") === "true";
}

export function setDemoMode(enabled: boolean) {
  localStorage.setItem("druginsight_demo", enabled ? "true" : "false");
}
