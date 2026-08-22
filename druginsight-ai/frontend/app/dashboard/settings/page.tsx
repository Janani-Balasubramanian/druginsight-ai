"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearAuth, getStoredUser, isDemoMode, setDemoMode } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const user = getStoredUser();
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    setDemo(isDemoMode());
  }, []);

  function toggleDemo() {
    const next = !demo;
    setDemo(next);
    setDemoMode(next);
  }

  function logout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Profile / Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Demo Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Toggle between LIVE MODEL and DEMO MODE. Demo data is labeled &quot;Demo / Sample Data&quot;
            and never presented as real scientific output.
          </p>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${!demo ? "text-success" : "text-slate-400"}`}>
              LIVE MODEL
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={demo}
              onClick={toggleDemo}
              className={`relative h-6 w-11 rounded-full transition-colors ${demo ? "bg-amber-500" : "bg-accent"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  demo ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${demo ? "text-amber-600" : "text-slate-400"}`}>
              DEMO MODE
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Scientific Limitations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
            <li>AI predictions are computational, not clinical evidence.</li>
            <li>The system does not replace laboratory experiments.</li>
            <li>The system does not provide medical advice.</li>
            <li>Drug candidates require experimental and clinical validation.</li>
            <li>Dataset quality directly affects model performance.</li>
            <li>Model confidence does not equal clinical effectiveness.</li>
          </ul>
        </CardContent>
      </Card>
      <Button variant="destructive" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}
