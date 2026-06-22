"use client";

import * as React from "react";
import Link from "next/link";
import { Receipt, RotateCcw, Home } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HouseholdProfileForm } from "@/components/dashboard/HouseholdProfileForm";
import { FlatDetailsForm } from "@/components/dashboard/FlatDetailsForm";
import { GrantEstimator } from "@/components/dashboard/GrantEstimator";
import { LoanCalculator } from "@/components/dashboard/LoanCalculator";
import { StampDutyCard } from "@/components/dashboard/StampDutyCard";
import { BuyerContributionTable } from "@/components/dashboard/BuyerContributionTable";
import { LoanSummaryCards } from "@/components/dashboard/LoanSummaryCards";
import { TimelineChecklist } from "@/components/dashboard/TimelineChecklist";
import { DisclaimerPanel } from "@/components/dashboard/DisclaimerPanel";
import { AssumptionsPanel } from "@/components/dashboard/AssumptionsPanel";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { APP_TITLE, STORAGE_KEY, freshSampleState } from "@/lib/constants";
import { computeBuyerBreakdowns, computeLoanSummary } from "@/lib/hdbCalculations";
import { estimateTotalGrants } from "@/lib/grantRules";
import { estimateStampDuty } from "@/lib/stampDuty";
import type { AppState } from "@/types/hdb";

export default function DashboardPage() {
  const [state, setState] = useLocalStorage<AppState>(STORAGE_KEY, freshSampleState());
  const [tab, setTab] = React.useState("profile");

  const { household, flat, split, policy, timeline, includeStampDutyInCash } = state;

  const update = <K extends keyof AppState>(key: K, value: AppState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const grantResult = React.useMemo(
    () => estimateTotalGrants(household, flat, policy.grant),
    [household, flat, policy.grant],
  );
  const loanSummary = React.useMemo(
    () => computeLoanSummary(flat, policy.loan),
    [flat, policy.loan],
  );
  const breakdowns = React.useMemo(
    () => computeBuyerBreakdowns(household, loanSummary, split),
    [household, loanSummary, split],
  );
  const stampDuty = React.useMemo(
    () => estimateStampDuty(household, flat, policy.stampDuty),
    [household, flat, policy.stampDuty],
  );

  const totalDownpaymentCash = breakdowns.reduce((sum, b) => sum + b.cashNeeded, 0);
  const cashNeededUpfront =
    totalDownpaymentCash + (includeStampDutyInCash ? stampDuty.total : 0);
  const householdIncome = household.buyer1.monthlyIncome + household.buyer2.monthlyIncome;

  const summaryData = {
    totalGrants: grantResult.total,
    totalLoan: loanSummary.maxLoan,
    monthlyInstalment: loanSummary.monthlyInstalment,
    cashOverValuation: loanSummary.cashOverValuation,
    cashNeededUpfront,
    buyer1Name: household.buyer1.name,
    buyer2Name: household.buyer2.name,
    buyer1MonthlyShare: breakdowns[0]?.monthlyInstalmentShare ?? 0,
    buyer2MonthlyShare: breakdowns[1]?.monthlyInstalmentShare ?? 0,
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{APP_TITLE}</h1>
            <p className="text-sm text-muted-foreground">
              Plan buyer eligibility, CPF grants, respective &amp; total loans, and cash required for an
              HDB resale flat.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 self-start">
          <Link href="/absd" className={buttonVariants({ variant: "outline" })}>
            <Receipt className="h-4 w-4" />
            ABSD calculator
          </Link>
          <Button variant="outline" onClick={() => setState(freshSampleState())}>
            <RotateCcw className="h-4 w-4" />
            Reset to sample
          </Button>
        </div>
      </header>

      <div className="mb-6">
        <DisclaimerPanel />
      </div>

      <section className="mb-6">
        <LoanSummaryCards data={summaryData} />
      </section>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile &amp; Flat</TabsTrigger>
          <TabsTrigger value="grants">Grants</TabsTrigger>
          <TabsTrigger value="loan">Loan &amp; Stamp Duty</TabsTrigger>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <HouseholdProfileForm
            household={household}
            onChange={(h) => update("household", h)}
          />
          <FlatDetailsForm flat={flat} onChange={(f) => update("flat", f)} />
        </TabsContent>

        <TabsContent value="grants">
          <GrantEstimator
            result={grantResult}
            householdIncome={householdIncome}
            ehgCeiling={policy.grant.ehgIncomeCeiling}
          />
        </TabsContent>

        <TabsContent value="loan" className="space-y-4">
          <LoanCalculator
            flat={flat}
            loanPolicy={policy.loan}
            summary={loanSummary}
            onFlatChange={(f) => update("flat", f)}
            onLoanPolicyChange={(loan) => update("policy", { ...policy, loan })}
          />
          <StampDutyCard
            result={stampDuty}
            includeInCash={includeStampDutyInCash}
            onIncludeInCashChange={(v) => update("includeStampDutyInCash", v)}
          />
        </TabsContent>

        <TabsContent value="contributions">
          <BuyerContributionTable
            breakdowns={breakdowns}
            split={split}
            onSplitChange={(s) => update("split", s)}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineChecklist timeline={timeline} onChange={(t) => update("timeline", t)} />
        </TabsContent>

        <TabsContent value="assumptions">
          <AssumptionsPanel policy={policy} onChange={(p) => update("policy", p)} />
        </TabsContent>
      </Tabs>

      <footer className="mt-8 space-y-3">
        <DisclaimerPanel />
        <p className="text-center text-xs text-muted-foreground">
          HDB Buyer Loan &amp; Grant Dashboard · Estimates only · Built for planning, not approval.
        </p>
      </footer>
    </main>
  );
}
