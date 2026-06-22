"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { NumberInput } from "@/components/ui/number-input";
import { formatCurrency, formatCurrencyPrecise, formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { BuyerBreakdown } from "@/lib/hdbCalculations";
import type { SplitConfig, SplitMode } from "@/types/hdb";

const MODE_LABELS: { mode: SplitMode; label: string }[] = [
  { mode: "EQUAL", label: "50 / 50" },
  { mode: "INCOME", label: "Income ratio" },
  { mode: "CUSTOM", label: "Custom split" },
];

export function BuyerContributionTable({
  breakdowns,
  split,
  onSplitChange,
}: {
  breakdowns: BuyerBreakdown[];
  split: SplitConfig;
  onSplitChange: (s: SplitConfig) => void;
}) {
  const totals = breakdowns.reduce(
    (acc, b) => ({
      income: acc.income + b.income,
      cpf: acc.cpf + b.cpfOaUsed,
      cash: acc.cash + b.cashNeeded,
      loan: acc.loan + b.loanResponsibility,
      monthly: acc.monthly + b.monthlyInstalmentShare,
    }),
    { income: 0, cpf: 0, cash: 0, loan: 0, monthly: 0 },
  );

  const customValid = split.customBuyer1Pct >= 0 && split.customBuyer1Pct <= 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Respective buyer contribution</CardTitle>
        <CardDescription>
          How the loan, CPF, and cash split between the two buyers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-wrap gap-2">
            {MODE_LABELS.map(({ mode, label }) => (
              <Button
                key={mode}
                size="sm"
                variant={split.mode === mode ? "default" : "outline"}
                onClick={() => onSplitChange({ ...split, mode })}
              >
                {label}
              </Button>
            ))}
          </div>
          {split.mode === "CUSTOM" && (
            <div className="flex items-end gap-3">
              <Field label="Buyer 1 %" htmlFor="custom-split" className="w-28">
                <NumberInput
                  id="custom-split"
                  value={split.customBuyer1Pct}
                  min={0}
                  max={100}
                  prefix="%"
                  onValueChange={(customBuyer1Pct) => onSplitChange({ ...split, customBuyer1Pct })}
                />
              </Field>
              <div className="pb-2 text-sm text-muted-foreground">
                Buyer 2: {formatPercent(100 - split.customBuyer1Pct, 0)}
              </div>
            </div>
          )}
        </div>

        {split.mode === "CUSTOM" && !customValid && (
          <p className="text-sm text-amber-700">Buyer 1 percentage must be between 0 and 100.</p>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Buyer</TableHead>
              <TableHead className="text-right">Income</TableHead>
              <TableHead className="text-right">Income share</TableHead>
              <TableHead className="text-right">Loan share</TableHead>
              <TableHead className="text-right">CPF OA used</TableHead>
              <TableHead className="text-right">Cash needed</TableHead>
              <TableHead className="text-right">Loan responsibility</TableHead>
              <TableHead className="text-right">Monthly share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breakdowns.map((b) => (
              <TableRow key={b.name}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(b.income)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatPercent(b.incomeSharePct)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatPercent(b.splitPct)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(b.cpfOaUsed)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(b.cashNeeded)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(b.loanResponsibility)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrencyPrecise(b.monthlyInstalmentShare)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className={cn("border-t-2 font-semibold")}>
              <TableCell>Total</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(totals.income)}</TableCell>
              <TableCell className="text-right tabular-nums">100%</TableCell>
              <TableCell className="text-right tabular-nums">100%</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(totals.cpf)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(totals.cash)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(totals.loan)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrencyPrecise(totals.monthly)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
