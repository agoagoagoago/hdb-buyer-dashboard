import { describe, expect, it } from "vitest";
import {
  buildGrantWarnings,
  estimateCitizenTopUp,
  estimateEHG,
  estimateFamilyGrant,
  estimateProximityGrant,
  estimateTotalGrants,
} from "@/lib/grantRules";
import { DEFAULT_POLICY, SAMPLE_STATE } from "@/lib/constants";
import type { HouseholdInputs } from "@/types/hdb";

const cfg = DEFAULT_POLICY.grant;
const base = SAMPLE_STATE.household;
const flat = SAMPLE_STATE.flat;

function household(patch: Partial<HouseholdInputs>): HouseholdInputs {
  return { ...base, ...patch };
}

describe("estimateFamilyGrant", () => {
  it("SC+SPR first-timer gets $70k for a 4-room", () => {
    expect(estimateFamilyGrant(base, flat, cfg)).toBe(70000);
  });
  it("SC+SPR first-timer gets $40k for a 5-room+", () => {
    expect(estimateFamilyGrant(base, { ...flat, flatType: "5-room" }, cfg)).toBe(40000);
  });
  it("SC+SC first-timer gets $80k / $50k", () => {
    const scsc = household({ buyer2: { ...base.buyer2, citizenship: "SC" } });
    expect(estimateFamilyGrant(scsc, flat, cfg)).toBe(80000);
    expect(estimateFamilyGrant(scsc, { ...flat, flatType: "Executive" }, cfg)).toBe(50000);
  });
  it("is $0 for second-timers", () => {
    expect(estimateFamilyGrant(household({ firstTimerStatus: "BOTH_SECOND" }), flat, cfg)).toBe(0);
  });
});

describe("estimateCitizenTopUp", () => {
  it("applies for SC+SPR with an SC child", () => {
    expect(estimateCitizenTopUp(base, cfg)).toBe(10000);
  });
  it("does not apply with no SC child and no conversion intent", () => {
    expect(
      estimateCitizenTopUp(household({ childrenCitizenship: "NONE_SC", numChildren: 1 }), cfg),
    ).toBe(0);
  });
  it("applies if the SPR spouse intends to become SC", () => {
    expect(
      estimateCitizenTopUp(
        household({ childrenCitizenship: "NONE_SC", numChildren: 0, sprWillBecomeSc: true }),
        cfg,
      ),
    ).toBe(10000);
  });
  it("does not apply to SC+SC couples", () => {
    expect(estimateCitizenTopUp(household({ buyer2: { ...base.buyer2, citizenship: "SC" } }), cfg)).toBe(0);
  });
});

describe("estimateProximityGrant", () => {
  it("is $30k living with parents, $20k within 4km, $0 otherwise", () => {
    expect(estimateProximityGrant(household({ proximity: "LIVING_WITH" }), cfg)).toBe(30000);
    expect(estimateProximityGrant(household({ proximity: "WITHIN_4KM" }), cfg)).toBe(20000);
    expect(estimateProximityGrant(household({ proximity: "NONE" }), cfg)).toBe(0);
  });
});

describe("estimateEHG", () => {
  it("is $0 above the income ceiling (sample earns $10.5k > $9k)", () => {
    expect(estimateEHG(base, cfg)).toBe(0);
  });
  it("returns the band grant for a qualifying income", () => {
    const lowIncome = household({
      buyer1: { ...base.buyer1, monthlyIncome: 2500 },
      buyer2: { ...base.buyer2, monthlyIncome: 1500 },
    });
    // $4,000 household income falls in the ≤$4,000 band → $95,000.
    expect(estimateEHG(lowIncome, cfg)).toBe(95000);
  });
});

describe("estimateTotalGrants", () => {
  it("sums components for the sample family (70k family + 10k top-up)", () => {
    const result = estimateTotalGrants(base, flat, cfg);
    expect(result.familyGrant).toBe(70000);
    expect(result.citizenTopUp).toBe(10000);
    expect(result.enhancedGrant).toBe(0);
    expect(result.proximityGrant).toBe(0);
    expect(result.total).toBe(80000);
  });
});

describe("buildGrantWarnings", () => {
  it("warns when a foreigner is a co-applicant", () => {
    const warnings = buildGrantWarnings(
      household({ buyer2: { ...base.buyer2, citizenship: "FOREIGNER" } }),
    );
    expect(warnings.some((w) => w.toLowerCase().includes("foreigner"))).toBe(true);
  });
  it("warns about SC+SPR scheme specifics", () => {
    expect(buildGrantWarnings(base).some((w) => w.includes("Citizen Top-Up"))).toBe(true);
  });
});
