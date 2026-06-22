import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Receipt } from "lucide-react";
import { AbsdCalculator } from "@/components/dashboard/AbsdCalculator";
import { DisclaimerPanel } from "@/components/dashboard/DisclaimerPanel";

export const metadata = {
  title: "ABSD Calculator · HDB Buyer Dashboard",
  description:
    "Estimate Additional Buyer's Stamp Duty (ABSD) for Singapore property buyers, including married-couple remission and refund cases. Estimates only — not financial advice.",
};

export default function AbsdPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <header className="mb-6 flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <Receipt className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">ABSD Calculator</h1>
          <p className="text-sm text-muted-foreground">
            Additional Buyer&apos;s Stamp Duty by buyer profile and property count, with married-couple
            remission &amp; refund cases highlighted.
          </p>
        </div>
      </header>

      <div className="mb-6">
        <DisclaimerPanel />
      </div>

      <AbsdCalculator />

      <footer className="mt-8 space-y-3">
        <DisclaimerPanel />
        <p className="text-center text-xs text-muted-foreground">
          HDB Buyer Loan &amp; Grant Dashboard · Estimates only · Built for planning, not approval.
        </p>
      </footer>
    </main>
  );
}
