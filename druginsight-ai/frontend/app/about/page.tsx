import { PublicNavbar } from "@/components/Navbar";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-16">
        <h1 className="text-3xl font-bold text-primary">About DrugInsight AI</h1>
        <p className="text-slate-600">
          DrugInsight AI is an academic research prototype for exploring drug repurposing opportunities
          using machine learning and explainable AI. It helps researchers screen drug-disease pairs,
          analyze drug-target interactions, and interpret model predictions with SHAP feature importance.
        </p>
        <DisclaimerBanner />
      </main>
    </div>
  );
}
