"use client";

import * as React from "react";
import { TrendingUp, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { NumberInput } from "@/components/ui/number-input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { computeBorrowingCapacity } from "@/lib/hdbCalculations";
import { formatCurrency, formatCurrencyPrecise, formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { FlatInputs, LoanPolicyConfig } from "@/types/hdb";

export function BorrowingCapacity({
  buyer1Name,
  buyer2Name,
  buyer1Income,
  buyer2Income,
  otherDebts,
  onOtherDebtsChange,
  flat,
  loan,
  ltvCappedLoan,
}: {
  buyer1Name: string;
  buyer2Name: string;
  buyer1Income: number;
  buyer2Income: number;
  otherDebts: number;
  onOtherDebtsChange: (v: number) => void;
  flat: FlatInputs;
  loan: LoanPolicyConfig;
  ltvCappedLoan: number;
}) {
  const isHdb = flat.loanType === "HDB";

  const rows = [
    { label: `${buyer1Name} only`, income: buyer1Income },
    { label: `${buyer2Name} only`, income: buyer2Income },
    { label: "Combined", income: buyer1Income + buyer2Income, highlight: true },
  ].map((r) => ({
    ...r,
    cap: computeBorrowingCapacity(r.income, otherDebts, flat.loanType, flat.tenureYears, loan),
  }));

  const combined = rows[rows.length - 1].cap;
  const effectiveMax = Math.min(combined.maxLoanFromIncome, ltvCappedLoan);
  const incomeBinds = combined.maxLoanFromIncome < ltvCappedLoan;
  const stressRate = isHdb ? loan.hdbStressRatePct : loan.bankStressRatePct;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>How much can you borrow?</CardTitle>
            <CardDescription>
              Income-based capacity ({isHdb ? "HDB loan — MSR only" : "bank loan — MSR & TDSR"}),
              sized at a {formatPercent(stressRate, 1)} stress-test rate over {flat.tenureYears} years.
            </CardDescription>
          </div>
          <TrendingUp className="h-5 w-5 shrink-0 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">
            Based on your <span className="font-medium text-foreground">combined</span> income, you can
            borrow about
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
            {formatCurrency(effectiveMax)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Limited by{" "}
            <Badge variant={incomeBinds ? "warning" : "success"}>
              {incomeBinds ? `income (${combined.bindingRatio})` : "the LTV cap"}
            </Badge>{" "}
            — income supports {formatCurrency(combined.maxLoanFromIncome)}; LTV allows{" "}
            {formatCurrency(ltvCappedLoan)}.
          </p>
        </div>

        {!isHdb && (
          <Field
            label="Other monthly debt repayments"
            htmlFor="other-debts"
            hint="Car loans, personal loans, credit-card minimums, etc. — reduces TDSR capacity (bank loans)."
            className="max-w-xs"
          >
            <NumberInput
              id="other-debts"
              value={otherDebts}
              min={0}
              prefix="$"
              onValueChange={onOtherDebtsChange}
            />
          </Field>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scenario</TableHead>
              <TableHead className="text-right">Gross income</TableHead>
              <TableHead className="text-right">Max repayment/mth</TableHead>
              <TableHead className="text-right">Limited by</TableHead>
              <TableHead className="text-right">Max loan (income)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.label} className={cn(r.highlight && "font-semibold")}>
                <TableCell className={cn(!r.highlight && "font-medium")}>{r.label}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(r.income)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrencyPrecise(r.cap.monthlyRepaymentCap)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{r.cap.bindingRatio}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(r.cap.maxLoanFromIncome)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Alert variant="info">
          <AlertDescription className="flex gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {isHdb
                ? "HDB loans are assessed on the Mortgage Servicing Ratio (MSR): repayments ≤ 30% of gross monthly income."
                : "Bank loans are assessed on the lower of MSR (≤ 30%) and TDSR (all debts ≤ 55% of income)."}{" "}
              The loan is sized at a stress-test rate ({formatPercent(stressRate, 1)}), not your actual
              rate. MSR/TDSR %, stress rate, and LTV are editable in the Assumptions tab. Actual
              eligibility also depends on age, remaining lease, credit assessment, and HDB/bank approval.
            </span>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
