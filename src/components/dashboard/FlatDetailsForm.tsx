"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { NumberInput } from "@/components/ui/number-input";
import { Select, type SelectOption } from "@/components/ui/select";
import type { FlatInputs, FlatType, LoanType } from "@/types/hdb";

const FLAT_TYPE_OPTIONS: SelectOption<FlatType>[] = [
  { value: "2-room", label: "2-room" },
  { value: "3-room", label: "3-room" },
  { value: "4-room", label: "4-room" },
  { value: "5-room", label: "5-room" },
  { value: "Executive", label: "Executive" },
];

const LOAN_TYPE_OPTIONS: SelectOption<LoanType>[] = [
  { value: "HDB", label: "HDB loan" },
  { value: "BANK", label: "Bank loan" },
];

export function FlatDetailsForm({
  flat,
  onChange,
}: {
  flat: FlatInputs;
  onChange: (f: FlatInputs) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Flat details</CardTitle>
        <CardDescription>The resale flat and the loan you intend to take.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Resale price" htmlFor="resale-price">
            <NumberInput
              id="resale-price"
              value={flat.resalePrice}
              min={0}
              prefix="$"
              onValueChange={(resalePrice) => onChange({ ...flat, resalePrice })}
            />
          </Field>
          <Field label="HDB valuation" htmlFor="valuation">
            <NumberInput
              id="valuation"
              value={flat.valuation}
              min={0}
              prefix="$"
              onValueChange={(valuation) => onChange({ ...flat, valuation })}
            />
          </Field>
          <Field label="Flat type" htmlFor="flat-type">
            <Select
              value={flat.flatType}
              options={FLAT_TYPE_OPTIONS}
              onValueChange={(flatType) => onChange({ ...flat, flatType })}
            />
          </Field>
          <Field label="Remaining lease (years)" htmlFor="lease">
            <NumberInput
              id="lease"
              value={flat.remainingLeaseYears}
              min={1}
              max={99}
              onValueChange={(remainingLeaseYears) => onChange({ ...flat, remainingLeaseYears })}
            />
          </Field>
          <Field label="Loan type" htmlFor="loan-type">
            <Select
              value={flat.loanType}
              options={LOAN_TYPE_OPTIONS}
              onValueChange={(loanType) => onChange({ ...flat, loanType })}
            />
          </Field>
          <Field
            label="Properties owned after purchase"
            htmlFor="property-count"
            hint="Drives the ABSD tier (1 = only home)."
          >
            <NumberInput
              id="property-count"
              value={flat.propertyCount}
              min={1}
              max={5}
              onValueChange={(propertyCount) => onChange({ ...flat, propertyCount })}
            />
          </Field>
          <Field label="Interest rate (% p.a.)" htmlFor="interest">
            <NumberInput
              id="interest"
              value={flat.interestRatePct}
              min={0}
              max={20}
              step="0.1"
              prefix="%"
              onValueChange={(interestRatePct) => onChange({ ...flat, interestRatePct })}
            />
          </Field>
          <Field label="Loan tenure (years)" htmlFor="tenure">
            <NumberInput
              id="tenure"
              value={flat.tenureYears}
              min={1}
              max={35}
              onValueChange={(tenureYears) => onChange({ ...flat, tenureYears })}
            />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
