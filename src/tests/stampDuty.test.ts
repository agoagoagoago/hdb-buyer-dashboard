import { describe, expect, it } from "vitest";
import { absdRateFor, calculateBsd, estimateStampDuty } from "@/lib/stampDuty";
import { DEFAULT_POLICY, SAMPLE_STATE } from "@/lib/constants";
import type { HouseholdInputs } from "@/types/hdb";

const cfg = DEFAULT_POLICY.stampDuty;
const base = SAMPLE_STATE.household;
const flat = SAMPLE_STATE.flat;

describe("calculateBsd", () => {
  it("computes progressive BSD for a $600k purchase", () => {
    // 1% of 180k + 2% of 180k + 3% of 240k = 1800 + 3600 + 7200 = 12600.
    expect(calculateBsd(600000, cfg)).toBe(12600);
  });
  it("is 0 for non-positive values", () => {
    expect(calculateBsd(0, cfg)).toBe(0);
  });
});

describe("absdRateFor", () => {
  it("returns first-property rates by citizenship", () => {
    expect(absdRateFor("SC", 1, cfg)).toBe(0);
    expect(absdRateFor("SPR", 1, cfg)).toBe(0.05);
    expect(absdRateFor("FOREIGNER", 1, cfg)).toBe(0.6);
  });
  it("clamps high property counts to the top tier", () => {
    expect(absdRateFor("SC", 9, cfg)).toBe(0.3);
  });
});

describe("estimateStampDuty", () => {
  it("uses the higher ABSD profile of the couple (SPR here) and flags remission", () => {
    const r = estimateStampDuty(base, flat, cfg);
    expect(r.dutiableValue).toBe(600000);
    expect(r.bsd).toBe(12600);
    expect(r.absdRate).toBe(0.05);
    expect(r.absdProfile).toBe("SPR");
    expect(r.absd).toBe(30000);
    expect(r.total).toBe(42600);
    expect(r.remissionNote).toBe(true);
  });

  it("charges no ABSD for an SC+SC couple buying their only home", () => {
    const scsc: HouseholdInputs = {
      ...base,
      buyer2: { ...base.buyer2, citizenship: "SC" },
    };
    const r = estimateStampDuty(scsc, flat, cfg);
    expect(r.absd).toBe(0);
    expect(r.total).toBe(12600);
  });
});
