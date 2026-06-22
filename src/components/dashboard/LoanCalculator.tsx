"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { NumberInput } from "@/components/ui/number-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency, formatCurrencyPrecise, formatPercent } from "@/lib/formatters";
import type { LoanSummary } from "@/lib/hdbCalculations";
import type { FlatInputs, LoanPolicyConfig } from "@/types/hdb";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <span className={strong ? "text-sm font-semibold" : "text-sm text-muted-foreground"}>
        {label}
      </span>
      <span className={`tabular-nums ${strong ? "text-sm font-semibold" : "text-sm font-medium"}`}>
        {value}
      </span>
    </div>
  );
}

export function LoanCalculator({
  flat,
  loanPolicy,
  summary,
  onFlatChange,
  onLoanPolicyChange,
}: {
  flat: FlatInputs;
  loanPolicy: LoanPolicyConfig;
  summary: LoanSummary;
  onFlatChange: (f: FlatInputs) => void;
  onLoanPolicyChange: (p: LoanPolicyConfig) => void;
}) {
  const isHdb = flat.loanType === "HDB";
  const ltvPct = (isHdb ? loanPolicy.hdbLtv : loanPolicy.bankLtv) * 100;

  const setLtv = (pct: number) => {
    const frac = pct / 100;
    onLoanPolicyChange(isHdb ? { ...loanPolicy, hdbLtv: frac } : { ...loanPolicy, bankLtv: frac });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Loan assumptions</CardTitle>
          <CardDescription>
            Editable so you can model policy changes. Currently using your {isHdb ? "HDB" : "bank"}{" "}
            loan selection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`${isHdb ? "HDB" : "Bank"} loan LTV limit (%)`} htmlFor="ltv">
              <NumberInput
                id="ltv"
                value={Number(ltvPct.toFixed(1))}
                min={0}
                max={90}
                step="1"
                prefix="%"
                onValueChange={setLtv}
              />
            </Field>
            {!isHdb && (
              <Field
                label="Min cash downpayment (%)"
                htmlFor="min-cash"
                hint="Of price/valuation; the rest of the downpayment may use CPF."
              >
                <NumberInput
                  id="min-cash"
                  value={Number((loanPolicy.bankMinCashFraction * 100).toFixed(1))}
                  min={0}
                  max={25}
                  step="1"
                  prefix="%"
                  onValueChange={(pct) =>
                    onLoanPolicyChange({ ...loanPolicy, bankMinCashFraction: pct / 100 })
                  }
                />
              </Field>
            )}
            <Field label="Interest rate (% p.a.)" htmlFor="loan-interest">
              <NumberInput
                id="loan-interest"
                value={flat.interestRatePct}
                min={0}
                max={20}
                step="0.1"
                prefix="%"
                onValueChange={(interestRatePct) => onFlatChange({ ...flat, interestRatePct })}
              />
            </Field>
            <Field label="Loan tenure (years)" htmlFor="loan-tenure">
              <NumberInput
                id="loan-tenure"
                value={flat.tenureYears}
                min={1}
                max={35}
                onValueChange={(tenureYears) => onFlatChange({ ...flat, tenureYears })}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loan & cash breakdown</CardTitle>
          <CardDescription>Estimated figures based on your inputs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-lg border border-border">
            <Row label="Purchase price" value={formatCurrency(flat.resalePrice)} />
            <Row label="Valuation" value={formatCurrency(flat.valuation)} />
            <Row label="Lower of price / valuation" value={formatCurrency(summary.lowerOfPriceValuation)} />
            <Row label="Cash-over-valuation (cash only)" value={formatCurrency(summary.cashOverValuation)} />
            <Row label={`Loan ceiling — LTV ${formatPercent(summary.ltvUsed * 100, 0)}`} value={formatCurrency(summary.ltvCappedLoan)} />
            <Row label="Loan ceiling — income (MSR/TDSR)" value={formatCurrency(summary.incomeCappedLoan)} />
            <Row
              label={`Maximum loan (limited by ${summary.bindingConstraint})`}
              value={formatCurrency(summary.maxLoan)}
              strong
            />
            <Row label="Downpayment required" value={formatCurrency(summary.downpayment)} />
            <Row label="— of which min cash" value={formatCurrency(summary.downpaymentMinCash)} />
            <Row label="— of which CPF OA / cash" value={formatCurrency(summary.downpaymentCpfOrCash)} />
            <Row label="Monthly instalment" value={formatCurrencyPrecise(summary.monthlyInstalment)} strong />
            <Row label="Total interest over tenure" value={formatCurrency(summary.totalInterest)} />
          </div>
        </CardContent>
      </Card>

      <Alert variant="muted" className="lg:col-span-2">
        <AlertDescription>
          Actual loan amount depends on HDB/bank approval, MSR/TDSR, CPF rules, age, remaining lease,
          and current regulations.
        </AlertDescription>
      </Alert>
    </div>
  );
}
