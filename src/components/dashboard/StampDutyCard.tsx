"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import type { StampDutyResult } from "@/lib/stampDuty";

const PROFILE_LABEL: Record<string, string> = {
  SC: "Singapore Citizen",
  SPR: "Singapore PR",
  FOREIGNER: "Foreigner",
};

export function StampDutyCard({
  result,
  includeInCash,
  onIncludeInCashChange,
}: {
  result: StampDutyResult;
  includeInCash: boolean;
  onIncludeInCashChange: (v: boolean) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stamp duty estimate</CardTitle>
        <CardDescription>
          Buyer&apos;s Stamp Duty (BSD) and Additional Buyer&apos;s Stamp Duty (ABSD). Payable in
          cash/CPF, not financed by the loan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="divide-y rounded-lg border border-border">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="text-sm text-muted-foreground">Dutiable value (higher of price/valuation)</span>
            <span className="text-sm font-medium tabular-nums">{formatCurrency(result.dutiableValue)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="text-sm text-muted-foreground">Buyer&apos;s Stamp Duty (BSD)</span>
            <span className="text-sm font-medium tabular-nums">{formatCurrency(result.bsd)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="text-sm text-muted-foreground">
              ABSD ({formatPercent(result.absdRate * 100, 0)} ·{" "}
              {PROFILE_LABEL[result.absdProfile] ?? result.absdProfile} profile)
            </span>
            <span className="text-sm font-medium tabular-nums">{formatCurrency(result.absd)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 bg-muted/50 px-4 py-3">
            <span className="text-sm font-semibold">Total stamp duty</span>
            <Badge variant="warning" className="text-sm tabular-nums">
              {formatCurrency(result.total)}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="include-stamp-duty"
            checked={includeInCash}
            onCheckedChange={onIncludeInCashChange}
          />
          <Label htmlFor="include-stamp-duty" className="cursor-pointer font-normal">
            Include stamp duty in &ldquo;cash needed upfront&rdquo;
          </Label>
        </div>

        {result.remissionNote && (
          <Alert variant="info">
            <AlertDescription>
              A married couple with at least one Singapore Citizen buying their only residential
              property may qualify for full ABSD remission. Verify with IRAS — this estimate shows
              ABSD before any remission.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
