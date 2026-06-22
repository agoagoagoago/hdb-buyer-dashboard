"use client";

import * as React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import type { GrantResult } from "@/lib/grantRules";

interface GrantLine {
  label: string;
  amount: number;
  note?: string;
}

export function GrantEstimator({
  result,
  householdIncome,
  ehgCeiling,
}: {
  result: GrantResult;
  householdIncome: number;
  ehgCeiling: number;
}) {
  const lines: GrantLine[] = [
    { label: "CPF Housing / Family Grant", amount: result.familyGrant },
    {
      label: "Enhanced CPF Housing Grant (EHG)",
      amount: result.enhancedGrant,
      note:
        householdIncome > ehgCeiling
          ? `Household income exceeds the EHG ceiling (${formatCurrency(ehgCeiling)}/mth).`
          : "Subject to HDB income assessment — not final approval.",
    },
    { label: "Proximity Housing Grant", amount: result.proximityGrant },
    { label: "Citizen Top-Up", amount: result.citizenTopUp },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grant estimator</CardTitle>
        <CardDescription>
          Estimated CPF housing grants based on your profile. Final eligibility and quantum are
          determined by HDB &amp; CPF.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="divide-y rounded-lg border border-border">
          {lines.map((line) => (
            <div key={line.label} className="flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{line.label}</p>
                {line.note && <p className="mt-0.5 text-xs text-muted-foreground">{line.note}</p>}
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {formatCurrency(line.amount)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 bg-muted/50 px-4 py-3">
            <p className="text-sm font-semibold">Total estimated grants</p>
            <Badge variant="success" className="text-sm tabular-nums">
              {formatCurrency(result.total)}
            </Badge>
          </div>
        </div>

        <Alert variant="info">
          <AlertDescription className="flex gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              EHG depends on official HDB eligibility and average gross monthly household income
              assessment. The bands here are editable estimates in the Assumptions tab.
            </span>
          </AlertDescription>
        </Alert>

        {result.warnings.map((w) => (
          <Alert key={w} variant="warning">
            <AlertDescription className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{w}</span>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
