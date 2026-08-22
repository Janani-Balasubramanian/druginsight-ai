"use client";

import Link from "next/link";
import { Activity, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <Activity className="h-6 w-6 text-accent" />
          DrugInsight AI
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Public navigation">
          <Link href="/about" className="text-slate-600 hover:text-primary">
            About
          </Link>
          <Link href="/methodology" className="text-slate-600 hover:text-primary">
            Methodology
          </Link>
          <Link href="/data-sources" className="text-slate-600 hover:text-primary">
            Data Sources
          </Link>
          <Link href="/login" className="text-slate-600 hover:text-primary">
            Login
          </Link>
          <Button asChild variant="accent" size="sm">
            <Link href="/register">Get Started</Link>
          </Button>
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

export function DashboardHeader({ title }: { title?: string }) {
  return (
    <div className="space-y-3 border-b border-slate-200 bg-white px-4 py-4 lg:px-8">
      {title && <h1 className="text-2xl font-semibold text-primary">{title}</h1>}
      <DisclaimerBanner compact />
    </div>
  );
}
