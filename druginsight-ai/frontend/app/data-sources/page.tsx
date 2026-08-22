import Link from "next/link";
import { PublicNavbar } from "@/components/Navbar";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sources = [
  {
    name: "PubChem",
    type: "Public",
    desc: "Chemical compounds and molecular structures.",
    url: "https://pubchem.ncbi.nlm.nih.gov/",
  },
  {
    name: "ChEMBL",
    type: "Public",
    desc: "Bioactivity information for drug-like molecules.",
    url: "https://www.ebi.ac.uk/chembl/",
  },
  {
    name: "PDB",
    type: "Public",
    desc: "Protein three-dimensional structures.",
    url: "https://www.rcsb.org/",
  },
  {
    name: "DrugBank",
    type: "Licensed / Restricted",
    desc: "Comprehensive drug and target data — requires license for full access.",
    url: "https://go.drugbank.com/",
  },
];

export default function DataSourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-16">
        <h1 className="text-3xl font-bold text-primary">Research / Data Sources</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {sources.map((s) => (
            <Card key={s.name}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {s.name}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      s.type === "Public" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {s.type}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{s.desc}</p>
                <Link href={s.url} className="mt-2 inline-block text-sm text-accent underline" target="_blank">
                  Official source →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <DisclaimerBanner />
      </main>
    </div>
  );
}
