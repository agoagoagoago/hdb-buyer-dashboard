"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Select, type SelectOption } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type {
  Buyer,
  ChildrenCitizenship,
  Citizenship,
  FirstTimerStatus,
  HouseholdInputs,
  ProximityStatus,
} from "@/types/hdb";

const CITIZENSHIP_OPTIONS: SelectOption<Citizenship>[] = [
  { value: "SC", label: "Singapore Citizen" },
  { value: "SPR", label: "Singapore PR" },
  { value: "FOREIGNER", label: "Foreigner" },
];

const CHILDREN_CITIZENSHIP_OPTIONS: SelectOption<ChildrenCitizenship>[] = [
  { value: "ALL_SC", label: "All Singapore Citizen" },
  { value: "SOME_SC", label: "Some Singapore Citizen" },
  { value: "NONE_SC", label: "None Singapore Citizen" },
];

const FIRST_TIMER_OPTIONS: SelectOption<FirstTimerStatus>[] = [
  { value: "BOTH_FIRST", label: "Both first-timer" },
  { value: "ONE_FIRST_ONE_SECOND", label: "One first-timer, one second-timer" },
  { value: "BOTH_SECOND", label: "Both second-timer" },
];

const PROXIMITY_OPTIONS: SelectOption<ProximityStatus>[] = [
  { value: "NONE", label: "No" },
  { value: "WITHIN_4KM", label: "Near parents within 4km" },
  { value: "LIVING_WITH", label: "Living with parents" },
];

function BuyerFields({
  prefix,
  buyer,
  onChange,
}: {
  prefix: string;
  buyer: Buyer;
  onChange: (b: Buyer) => void;
}) {
  const id = (f: string) => `${prefix}-${f}`.toLowerCase().replace(/\s/g, "");
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={`${prefix} name`} htmlFor={id("name")} className="sm:col-span-2">
        <Input
          id={id("name")}
          value={buyer.name}
          onChange={(e) => onChange({ ...buyer, name: e.target.value })}
        />
      </Field>
      <Field label="Citizenship" htmlFor={id("cit")}>
        <Select
          value={buyer.citizenship}
          options={CITIZENSHIP_OPTIONS}
          onValueChange={(citizenship) => onChange({ ...buyer, citizenship })}
        />
      </Field>
      <Field label="Age" htmlFor={id("age")}>
        <NumberInput
          id={id("age")}
          value={buyer.age}
          min={18}
          max={99}
          onValueChange={(age) => onChange({ ...buyer, age })}
        />
      </Field>
      <Field label="Monthly income" htmlFor={id("income")}>
        <NumberInput
          id={id("income")}
          value={buyer.monthlyIncome}
          min={0}
          prefix="$"
          onValueChange={(monthlyIncome) => onChange({ ...buyer, monthlyIncome })}
        />
      </Field>
      <Field label="CPF OA available" htmlFor={id("cpf")}>
        <NumberInput
          id={id("cpf")}
          value={buyer.cpfOaAvailable}
          min={0}
          prefix="$"
          onValueChange={(cpfOaAvailable) => onChange({ ...buyer, cpfOaAvailable })}
        />
      </Field>
    </div>
  );
}

export function HouseholdProfileForm({
  household,
  onChange,
}: {
  household: HouseholdInputs;
  onChange: (h: HouseholdInputs) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Buyer 1</CardTitle>
          <CardDescription>Primary applicant details.</CardDescription>
        </CardHeader>
        <CardContent>
          <BuyerFields
            prefix="Buyer 1"
            buyer={household.buyer1}
            onChange={(buyer1) => onChange({ ...household, buyer1 })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buyer 2</CardTitle>
          <CardDescription>Co-applicant / spouse details.</CardDescription>
        </CardHeader>
        <CardContent>
          <BuyerFields
            prefix="Buyer 2"
            buyer={household.buyer2}
            onChange={(buyer2) => onChange({ ...household, buyer2 })}
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Household & eligibility</CardTitle>
          <CardDescription>Used to estimate grants and eligibility.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Number of children" htmlFor="num-children">
              <NumberInput
                id="num-children"
                value={household.numChildren}
                min={0}
                max={20}
                onValueChange={(numChildren) => onChange({ ...household, numChildren })}
              />
            </Field>
            <Field label="Children citizenship status" htmlFor="children-cit">
              <Select
                value={household.childrenCitizenship}
                options={CHILDREN_CITIZENSHIP_OPTIONS}
                onValueChange={(childrenCitizenship) =>
                  onChange({ ...household, childrenCitizenship })
                }
              />
            </Field>
            <Field label="First-timer status" htmlFor="first-timer">
              <Select
                value={household.firstTimerStatus}
                options={FIRST_TIMER_OPTIONS}
                onValueChange={(firstTimerStatus) => onChange({ ...household, firstTimerStatus })}
              />
            </Field>
            <Field label="Buying near parents" htmlFor="proximity">
              <Select
                value={household.proximity}
                options={PROXIMITY_OPTIONS}
                onValueChange={(proximity) => onChange({ ...household, proximity })}
              />
            </Field>
            <div className="flex items-center gap-2 self-end pb-2 sm:col-span-2">
              <Checkbox
                id="spr-to-sc"
                checked={household.sprWillBecomeSc}
                onCheckedChange={(sprWillBecomeSc) => onChange({ ...household, sprWillBecomeSc })}
              />
              <Label htmlFor="spr-to-sc" className="cursor-pointer font-normal">
                SPR spouse intends to take up Singapore citizenship (affects Citizen Top-Up)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
