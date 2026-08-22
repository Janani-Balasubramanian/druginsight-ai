"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Beaker,
  Brain,
  GitCompare,
  History,
  LayoutDashboard,
  Microscope,
  Network,
  Pill,
  Settings,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/drug-search", label: "Drug Search", icon: Pill },
  { href: "/dashboard/disease-analysis", label: "Disease Analysis", icon: Stethoscope },
  { href: "/dashboard/repurposing", label: "Drug Repurposing", icon: Beaker },
  { href: "/dashboard/drug-target", label: "Drug-Target Analysis", icon: Network },
  { href: "/dashboard/explainable-ai", label: "Explainable AI", icon: Brain },
  { href: "/dashboard/compare", label: "Compare Drugs", icon: GitCompare },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/methodology", label: "Methodology", icon: Microscope },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <aside
      className={cn(
        "flex flex-col border-r border-slate-200 bg-white",
        mobile ? "w-full" : "hidden w-64 shrink-0 lg:flex"
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-5">
        <Activity className="h-6 w-6 text-accent" />
        <span className="font-semibold text-primary">DrugInsight AI</span>
      </div>
      <nav className="flex-1 space-y-1 p-3" aria-label="Main navigation">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-slate-100 font-medium text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
