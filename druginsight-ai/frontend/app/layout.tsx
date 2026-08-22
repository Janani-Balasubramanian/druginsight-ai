import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "DrugInsight AI — Drug Repurposing Research Platform",
  description:
    "AI-powered drug discovery and repurposing using explainable machine learning. Academic research prototype.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen bg-background font-sans text-slate-text antialiased`}>
        {children}
      </body>
    </html>
  );
}
