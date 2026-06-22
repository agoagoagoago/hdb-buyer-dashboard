"use client";

import * as React from "react";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Field } from "@/components/ui/field";
import { NumberInput } from "@/components/ui/number-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import type { PolicyConfig } from "@/types/hdb";

export function AssumptionsPanel({
  policy,
  onChange,
}: {
  policy: PolicyConfig;
  onChange: (p: PolicyConfig) => void;
}) {
  const { loan, grant, stampDuty } = policy;

  const setGrant = (patch: Partial<PolicyConfig["grant"]>) =>
    onChange({ ...policy, grant: { ...grant, ...patch } });

  return (
    <div className="space-y-4">
      <Alert variant="info">
        <AlertDescription>
          Every figure below is editable so the tool can keep up with policy changes. Defaults reflect
          publicly published rules at build time — always confirm current figures with HDB, CPF, and
          IRAS before relying on them.
        </AlertDescription>
      </Alert>

      <Accordion>
        <AccordionItem title="Loan-to-value (LTV) & cash rules" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="HDB loan LTV (%)" htmlFor="cfg-hdb-ltv">
              <NumberInput
                id="cfg-hdb-ltv"
                value={Number((loan.hdbLtv * 100).toFixed(1))}
                min={0}
                max={90}
                prefix="%"
                onValueChange={(v) =>
                  onChange({ ...policy, loan: { ...loan, hdbLtv: v / 100 } })
                }
              />
            </Field>
            <Field label="Bank loan LTV (%)" htmlFor="cfg-bank-ltv">
              <NumberInput
                id="cfg-bank-ltv"
                value={Number((loan.bankLtv * 100).toFixed(1))}
                min={0}
                max={90}
                prefix="%"
                onValueChange={(v) =>
                  onChange({ ...policy, loan: { ...loan, bankLtv: v / 100 } })
                }
              />
            </Field>
            <Field label="Bank min cash (%)" htmlFor="cfg-min-cash">
              <NumberInput
                id="cfg-min-cash"
                value={Number((loan.bankMinCashFraction * 100).toFixed(1))}
                min={0}
                max={25}
                prefix="%"
                onValueChange={(v) =>
                  onChange({ ...policy, loan: { ...loan, bankMinCashFraction: v / 100 } })
                }
              />
            </Field>
          </div>
        </AccordionItem>

        <AccordionItem title="Affordability (MSR / TDSR & stress rates)">
          <p className="mb-3 text-xs text-muted-foreground">
            Used to compute the income-based maximum loan. HDB loans use MSR only; bank loans use the
            lower of MSR and TDSR. The loan is sized at the stress-test (medium-term) rate.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="MSR cap (%)" htmlFor="cfg-msr">
              <NumberInput
                id="cfg-msr"
                value={Number((loan.msr * 100).toFixed(1))}
                min={0}
                max={100}
                prefix="%"
                onValueChange={(v) => onChange({ ...policy, loan: { ...loan, msr: v / 100 } })}
              />
            </Field>
            <Field label="TDSR cap (%)" htmlFor="cfg-tdsr">
              <NumberInput
                id="cfg-tdsr"
                value={Number((loan.tdsr * 100).toFixed(1))}
                min={0}
                max={100}
                prefix="%"
                onValueChange={(v) => onChange({ ...policy, loan: { ...loan, tdsr: v / 100 } })}
              />
            </Field>
            <Field label="HDB stress rate (% p.a.)" htmlFor="cfg-hdb-stress">
              <NumberInput
                id="cfg-hdb-stress"
                value={loan.hdbStressRatePct}
                min={0}
                max={20}
                step="0.1"
                prefix="%"
                onValueChange={(v) => onChange({ ...policy, loan: { ...loan, hdbStressRatePct: v } })}
              />
            </Field>
            <Field label="Bank stress rate (% p.a.)" htmlFor="cfg-bank-stress">
              <NumberInput
                id="cfg-bank-stress"
                value={loan.bankStressRatePct}
                min={0}
                max={20}
                step="0.1"
                prefix="%"
                onValueChange={(v) =>
                  onChange({ ...policy, loan: { ...loan, bankStressRatePct: v } })
                }
              />
            </Field>
          </div>
        </AccordionItem>

        <AccordionItem title="Grant amounts">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="SC+SC Family (2–4 room)" htmlFor="g1">
              <NumberInput id="g1" prefix="$" min={0} value={grant.familyGrantScSc.smallFlat}
                onValueChange={(v) => setGrant({ familyGrantScSc: { ...grant.familyGrantScSc, smallFlat: v } })} />
            </Field>
            <Field label="SC+SC Family (5-room+)" htmlFor="g2">
              <NumberInput id="g2" prefix="$" min={0} value={grant.familyGrantScSc.largeFlat}
                onValueChange={(v) => setGrant({ familyGrantScSc: { ...grant.familyGrantScSc, largeFlat: v } })} />
            </Field>
            <Field label="SC+SPR Family (2–4 room)" htmlFor="g3">
              <NumberInput id="g3" prefix="$" min={0} value={grant.familyGrantScSpr.smallFlat}
                onValueChange={(v) => setGrant({ familyGrantScSpr: { ...grant.familyGrantScSpr, smallFlat: v } })} />
            </Field>
            <Field label="SC+SPR Family (5-room+)" htmlFor="g4">
              <NumberInput id="g4" prefix="$" min={0} value={grant.familyGrantScSpr.largeFlat}
                onValueChange={(v) => setGrant({ familyGrantScSpr: { ...grant.familyGrantScSpr, largeFlat: v } })} />
            </Field>
            <Field label="Citizen Top-Up" htmlFor="g5">
              <NumberInput id="g5" prefix="$" min={0} value={grant.citizenTopUp}
                onValueChange={(v) => setGrant({ citizenTopUp: v })} />
            </Field>
            <Field label="Proximity (living with)" htmlFor="g6">
              <NumberInput id="g6" prefix="$" min={0} value={grant.proximityLivingWith}
                onValueChange={(v) => setGrant({ proximityLivingWith: v })} />
            </Field>
            <Field label="Proximity (within 4km)" htmlFor="g7">
              <NumberInput id="g7" prefix="$" min={0} value={grant.proximityWithin4km}
                onValueChange={(v) => setGrant({ proximityWithin4km: v })} />
            </Field>
            <Field label="EHG income ceiling (monthly)" htmlFor="g8">
              <NumberInput id="g8" prefix="$" min={0} value={grant.ehgIncomeCeiling}
                onValueChange={(v) => setGrant({ ehgIncomeCeiling: v })} />
            </Field>
          </div>
        </AccordionItem>

        <AccordionItem title="EHG income bands">
          <p className="mb-3 text-xs text-muted-foreground">
            Grant by average gross monthly household income (inclusive upper bound). Edit the grant per
            band.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Income up to</TableHead>
                <TableHead className="text-right">EHG grant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grant.ehgBands.map((band, idx) => (
                <TableRow key={band.maxIncome}>
                  <TableCell className="tabular-nums">{formatCurrency(band.maxIncome)}</TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto w-32">
                      <NumberInput
                        prefix="$"
                        min={0}
                        value={band.grant}
                        onValueChange={(v) => {
                          const ehgBands = grant.ehgBands.map((b, i) =>
                            i === idx ? { ...b, grant: v } : b,
                          );
                          setGrant({ ehgBands });
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionItem>

        <AccordionItem title="Stamp duty (BSD brackets & ABSD)">
          <p className="mb-2 text-sm font-medium">BSD brackets</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bracket width</TableHead>
                <TableHead className="text-right">Rate (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stampDuty.bsdBrackets.map((br, idx) => (
                <TableRow key={idx}>
                  <TableCell className="tabular-nums">
                    {Number.isFinite(br.upTo) ? formatCurrency(br.upTo) : "Remainder"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto w-24">
                      <NumberInput
                        prefix="%"
                        min={0}
                        max={100}
                        step="0.1"
                        value={Number((br.rate * 100).toFixed(2))}
                        onValueChange={(v) => {
                          const bsdBrackets = stampDuty.bsdBrackets.map((b, i) =>
                            i === idx ? { ...b, rate: v / 100 } : b,
                          );
                          onChange({ ...policy, stampDuty: { ...stampDuty, bsdBrackets } });
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className="mb-2 mt-4 text-sm font-medium">ABSD rates by property count (%)</p>
          {(["sc", "spr", "foreigner"] as const).map((profile) => (
            <div key={profile} className="mb-3">
              <p className="mb-1 text-xs uppercase text-muted-foreground">
                {profile === "sc" ? "Singapore Citizen" : profile === "spr" ? "Singapore PR" : "Foreigner"}
              </p>
              <div className="flex gap-2">
                {stampDuty.absd[profile].map((rate, idx) => (
                  <div key={idx} className="w-24">
                    <NumberInput
                      prefix="%"
                      min={0}
                      max={100}
                      step="1"
                      value={Number((rate * 100).toFixed(1))}
                      onValueChange={(v) => {
                        const arr = stampDuty.absd[profile].map((r, i) =>
                          i === idx ? v / 100 : r,
                        );
                        onChange({
                          ...policy,
                          stampDuty: { ...stampDuty, absd: { ...stampDuty.absd, [profile]: arr } },
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </AccordionItem>
      </Accordion>
    </div>
  );
}
