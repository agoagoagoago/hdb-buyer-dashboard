"use client";

import * as React from "react";
import { BadgeCheck, CircleDollarSign, Info, RefreshCw, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { NumberInput } from "@/components/ui/number-input";
import { Select, type SelectOption } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { assessAbsd, calculateBsd, type AbsdBuyerProfile } from "@/lib/stampDuty";
import { DEFAULT_POLICY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Citizenship } from "@/types/hdb";

const cfg = DEFAULT_POLICY.stampDuty;

const BUYER1_OPTIONS: SelectOption<Citizenship>[] = [
  { value: "SC", label: "Singapore Citizen" },
  { value: "SPR", label: "Singapore PR" },
  { value: "FOREIGNER", label: "Foreigner" },
];

const BUYER2_OPTIONS: SelectOption<AbsdBuyerProfile>[] = [
  { value: "NONE", label: "No second buyer (single)" },
  { value: "SC", label: "Singapore Citizen" },
  { value: "SPR", label: "Singapore PR" },
  { value: "FOREIGNER", label: "Foreigner" },
];

const OWNED_OPTIONS: SelectOption<string>[] = [
  { value: "0", label: "0 — this is our first/only home" },
  { value: "1", label: "1 other property" },
  { value: "2", label: "2 or more other properties" },
];

const REMISSION_META = {
  full: { label: "Full remission — $0 ABSD", variant: "success" as const, icon: BadgeCheck },
  refund: { label: "Refund possible", variant: "info" as const, icon: RefreshCw },
  none: { label: "No remission", variant: "secondary" as const, icon: XCircle },
};

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <span className={strong ? "text-sm font-semibold" : "text-sm text-muted-foreground"}>
        {label}
      </span>
      <span className={cn("tabular-nums text-sm", strong ? "font-semibold" : "font-medium")}>
        {value}
      </span>
    </div>
  );
}

export function AbsdCalculator() {
  const [price, setPrice] = React.useState(600000);
  const [buyer1, setBuyer1] = React.useState<Citizenship>("SC");
  const [buyer2, setBuyer2] = React.useState<AbsdBuyerProfile>("SPR");
  const [isMarried, setIsMarried] = React.useState(true);
  const [ownedBefore, setOwnedBefore] = React.useState(0);
  const [willSell, setWillSell] = React.useState(false);

  const assessment = React.useMemo(
    () =>
      assessAbsd(
        {
          dutiableValue: price,
          buyer1,
          buyer2,
          isMarried,
          propertiesOwnedBefore: ownedBefore,
          willSellFirstProperty: willSell,
        },
        cfg,
      ),
    [price, buyer1, buyer2, isMarried, ownedBefore, willSell],
  );

  const bsd = calculateBsd(price, cfg);
  const remission = REMISSION_META[assessment.remission];
  const RemissionIcon = remission.icon;
  const hasSecondBuyer = buyer2 !== "NONE";
  const isSecondProperty = assessment.propertyCountAfter >= 2;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>ABSD inputs</CardTitle>
          <CardDescription>
            Additional Buyer&apos;s Stamp Duty depends on each buyer&apos;s profile and how many
            residential properties you own.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Purchase price / value" htmlFor="absd-price" className="sm:col-span-2">
              <NumberInput
                id="absd-price"
                value={price}
                min={0}
                prefix="$"
                onValueChange={setPrice}
              />
            </Field>
            <Field label="Buyer 1 citizenship" htmlFor="absd-b1">
              <Select value={buyer1} options={BUYER1_OPTIONS} onValueChange={setBuyer1} />
            </Field>
            <Field label="Buyer 2 citizenship" htmlFor="absd-b2">
              <Select value={buyer2} options={BUYER2_OPTIONS} onValueChange={setBuyer2} />
            </Field>
            <Field
              label="Other residential properties owned"
              htmlFor="absd-owned"
              className="sm:col-span-2"
            >
              <Select
                value={String(ownedBefore)}
                options={OWNED_OPTIONS}
                onValueChange={(v) => setOwnedBefore(Number(v))}
              />
            </Field>

            {hasSecondBuyer && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox id="absd-married" checked={isMarried} onCheckedChange={setIsMarried} />
                <Label htmlFor="absd-married" className="cursor-pointer font-normal">
                  Buyers are legally married and buying jointly
                </Label>
              </div>
            )}
            {hasSecondBuyer && isMarried && isSecondProperty && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox id="absd-sell" checked={willSell} onCheckedChange={setWillSell} />
                <Label htmlFor="absd-sell" className="cursor-pointer font-normal">
                  We will sell our existing property within the qualifying period
                </Label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>ABSD result</CardTitle>
            <Badge variant={remission.variant} className="gap-1">
              <RemissionIcon className="h-3.5 w-3.5" />
              {remission.label}
            </Badge>
          </div>
          <CardDescription>
            {assessment.propertyCountAfter === 1
              ? "Treated as your first residential property."
              : `Treated as residential property #${assessment.propertyCountAfter}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y rounded-lg border border-border">
            <Row
              label={`ABSD rate (${assessment.applicableProfile} profile)`}
              value={formatPercent(assessment.rate * 100, 0)}
            />
            <Row label="ABSD before remission" value={formatCurrency(assessment.grossAbsd)} />
            <Row label="ABSD payable upfront" value={formatCurrency(assessment.netAbsd)} strong />
            <Row label="Buyer's Stamp Duty (BSD)" value={formatCurrency(bsd)} />
            <div className="flex items-center justify-between gap-3 bg-muted/50 px-4 py-3">
              <span className="text-sm font-semibold">Total stamp duty payable upfront</span>
              <Badge variant="warning" className="text-sm tabular-nums">
                {formatCurrency(assessment.netAbsd + bsd)}
              </Badge>
            </div>
          </div>

          {assessment.remission === "refund" && (
            <Alert variant="info">
              <AlertDescription className="flex gap-2">
                <RefreshCw className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  You pay {formatCurrency(assessment.grossAbsd)} upfront, then claim it back once you
                  sell your first property within the qualifying period.
                </span>
              </AlertDescription>
            </Alert>
          )}

          {assessment.notes.map((note) => (
            <Alert key={note} variant={assessment.remission === "full" ? "info" : "muted"}>
              <AlertDescription className="flex gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{note}</span>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>When is ABSD remission possible?</CardTitle>
          <CardDescription>
            The remission rules that can reduce or refund ABSD for couples.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <RemissionCase
            active={assessment.remission === "full"}
            icon={BadgeCheck}
            title="Full remission — married couple, first property"
            body="A legally married couple with at least one Singapore Citizen, buying their first residential property jointly (and owning no other residential property), pays no ABSD."
          />
          <RemissionCase
            active={assessment.remission === "refund"}
            icon={RefreshCw}
            title="Refund — married SC couple replacing their home"
            body="A married couple with at least one Singapore Citizen buying a second property can claim an ABSD refund if they sell their first residential property within the qualifying period. ABSD is paid upfront and refunded later."
          />
          <RemissionCase
            active={false}
            icon={CircleDollarSign}
            title="SC + SC, first property"
            body="Two Singapore Citizens buying their first property are charged 0% ABSD outright — no remission needed."
          />
          <Alert variant="warning">
            <AlertDescription>
              Estimates only. Remission eligibility, qualifying periods, and rates are set by IRAS and
              change over time. Confirm with IRAS and a conveyancing lawyer, and note that ABSD is
              assessed on the buyer with the highest applicable rate. BSD always applies.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>ABSD rate reference</CardTitle>
          <CardDescription>Current default rates (editable in the dashboard&apos;s Assumptions tab).</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead className="text-right">1st property</TableHead>
                <TableHead className="text-right">2nd property</TableHead>
                <TableHead className="text-right">3rd+ property</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(
                [
                  ["Singapore Citizen", cfg.absd.sc],
                  ["Singapore PR", cfg.absd.spr],
                  ["Foreigner", cfg.absd.foreigner],
                ] as const
              ).map(([label, rates]) => (
                <TableRow key={label}>
                  <TableCell className="font-medium">{label}</TableCell>
                  {[0, 1, 2].map((i) => (
                    <TableCell key={i} className="text-right tabular-nums">
                      {formatPercent((rates[i] ?? rates[rates.length - 1]) * 100, 0)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function RemissionCase({
  active,
  icon: Icon,
  title,
  body,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-3",
        active ? "border-emerald-300 bg-emerald-50" : "border-border bg-card",
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", active ? "text-emerald-600" : "text-muted-foreground")} />
      <div>
        <p className="flex items-center gap-2 text-sm font-medium">
          {title}
          {active && <Badge variant="success">Applies to you</Badge>}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
