"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  FlaskConical,
  Search,
  Shield,
  Sparkles,
} from "lucide-react";
import { PublicNavbar } from "@/components/Navbar";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Drug candidates analyzed", value: "Model Dataset" },
  { label: "Targets analyzed", value: "Demo Data" },
  { label: "Predictions generated", value: "Demo Data" },
  { label: "Model accuracy", value: "After training" },
];

const features = [
  { icon: Search, title: "Faster computational screening", desc: "Screen drug-disease pairs at scale." },
  { icon: Brain, title: "Explainable predictions", desc: "SHAP feature importance for every result." },
  { icon: FlaskConical, title: "Drug repurposing support", desc: "Explore potential research candidates." },
  { icon: BarChart3, title: "Interactive research dashboard", desc: "Visualize predictions and history." },
];

const steps = [
  "Search",
  "Collect Data",
  "Extract Features",
  "AI Prediction",
  "Explain Prediction",
  "Explore Results",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="mb-3 text-sm font-medium text-accent">Academic Research Prototype</p>
            <h1 className="text-4xl font-bold tracking-tight text-primary lg:text-5xl">
              Discover New Possibilities in Drug Repurposing with AI
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              DrugInsight AI combines biomedical data, machine learning, and Explainable AI to help
              researchers explore potential drug-target relationships and repurposing opportunities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="accent" size="lg">
                <Link href="/register">
                  Explore the Platform <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/methodology">View Methodology</Link>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-primary to-slate-800 p-6 text-white">
                  <div className="flex items-center gap-2 text-sm text-cyan-200">
                    <Sparkles className="h-4 w-4" /> Research Dashboard Preview
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {["Repurposing", "Targets", "SHAP", "History"].map((item) => (
                      <div key={item} className="rounded-lg bg-white/10 p-3 text-sm backdrop-blur">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 p-4">
                  {[40, 65, 55, 80].map((h, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-full rounded bg-accent/20" style={{ height: h }} />
                      <span className="text-[10px] text-slate-400">Demo</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="border-y border-slate-200 bg-white py-10">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="mt-1 text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-center text-3xl font-bold text-primary">Why DrugInsight AI</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <Card key={title}>
                <CardContent className="p-6">
                  <Icon className="h-8 w-8 text-accent" />
                  <h3 className="mt-3 font-semibold text-primary">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-center text-3xl font-bold text-primary">How It Works</h2>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {steps.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-700">{step}</span>
                  {i < steps.length - 1 && <span className="hidden text-slate-300 md:inline">→</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-12">
          <DisclaimerBanner />
        </section>

        <footer className="border-t border-slate-200 bg-primary py-8 text-center text-sm text-slate-300">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            <span>DrugInsight AI — Computational research only. Not for clinical use.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
