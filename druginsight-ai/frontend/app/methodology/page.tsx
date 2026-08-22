import { PublicNavbar } from "@/components/Navbar";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

const steps = [
  { title: "Literature Survey", desc: "Review existing drug repurposing and ML research." },
  { title: "Problem Definition", desc: "Define computational screening for drug-disease pairs." },
  { title: "Dataset Collection", desc: "Curate drug, disease, and bioactivity data from public sources." },
  { title: "Data Preprocessing", desc: "Clean, normalize, and encode molecular features." },
  { title: "Feature Engineering", desc: "Extract molecular descriptors and activity features." },
  { title: "ML Model Development", desc: "Train a Random Forest baseline classifier." },
  { title: "Explainable AI", desc: "Apply SHAP for per-prediction feature importance." },
  { title: "Testing & Evaluation", desc: "Validate with accuracy, precision, recall, F1, ROC-AUC." },
  { title: "Prediction Dashboard", desc: "Interactive UI for researchers to explore results." },
];

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-16">
        <h1 className="text-3xl font-bold text-primary">Methodology</h1>
        <div className="space-y-4">
          {steps.map((s, i) => (
            <div key={s.title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h2 className="font-semibold text-primary">{s.title}</h2>
                <p className="text-sm text-slate-600">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <DisclaimerBanner />
      </main>
    </div>
  );
}
