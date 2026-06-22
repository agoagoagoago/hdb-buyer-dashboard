"use client";

import * as React from "react";
import {
  Banknote,
  CalendarClock,
  Coins,
  Gift,
  HandCoins,
  User,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatCurrencyPrecise } from "@/lib/formatters";

export interface SummaryData {
  totalGrants: number;
  totalLoan: number;
  monthlyInstalment: number;
  cashOverValuation: number;
  cashNeededUpfront: number;
  buyer1Name: string;
  buyer2Name: string;
  buyer1MonthlyShare: number;
  buyer2MonthlyShare: number;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 shrink-0 ${accent ?? "text-primary"}`} />
      </div>
      <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight">{value}</p>
    </Card>
  );
}

export function LoanSummaryCards({ data }: { data: SummaryData }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <SummaryCard icon={Gift} label="Estimated total grants" value={formatCurrency(data.totalGrants)} accent="text-emerald-600" />
      <SummaryCard icon={Banknote} label="Estimated total loan" value={formatCurrency(data.totalLoan)} />
      <SummaryCard icon={CalendarClock} label="Estimated monthly instalment" value={formatCurrencyPrecise(data.monthlyInstalment)} />
      <SummaryCard icon={Coins} label="Estimated cash-over-valuation" value={formatCurrency(data.cashOverValuation)} accent="text-amber-600" />
      <SummaryCard icon={Wallet} label="Estimated cash needed upfront" value={formatCurrency(data.cashNeededUpfront)} accent="text-amber-600" />
      <SummaryCard icon={HandCoins} label="Total loan responsibility" value={formatCurrency(data.totalLoan)} />
      <SummaryCard icon={User} label={`${data.buyer1Name} monthly share`} value={formatCurrencyPrecise(data.buyer1MonthlyShare)} />
      <SummaryCard icon={User} label={`${data.buyer2Name} monthly share`} value={formatCurrencyPrecise(data.buyer2MonthlyShare)} />
    </div>
  );
}
