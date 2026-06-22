import { describe, expect, it } from "vitest";
import { DEFAULT_POLICY, SAMPLE_STATE, normalizeState } from "@/lib/constants";

describe("normalizeState", () => {
  it("backfills affordability fields missing from older saved state", () => {
    // Simulate state saved before MSR/TDSR/stress rates and monthlyDebtObligations existed.
    const oldState = {
      household: {
        buyer1: { name: "A", citizenship: "SC", monthlyIncome: 7000, cpfOaAvailable: 1000, age: 40 },
        buyer2: { name: "B", citizenship: "SPR", monthlyIncome: 3000, cpfOaAvailable: 500, age: 38 },
        numChildren: 1,
        childrenCitizenship: "ALL_SC",
        firstTimerStatus: "BOTH_FIRST",
        proximity: "NONE",
        sprWillBecomeSc: false,
        // no monthlyDebtObligations
      },
      flat: { ...SAMPLE_STATE.flat, loanType: "BANK" },
      split: SAMPLE_STATE.split,
      policy: {
        loan: { hdbLtv: 0.75, bankLtv: 0.75, bankMinCashFraction: 0.05 }, // no msr/tdsr/stress
        grant: SAMPLE_STATE.policy.grant,
        stampDuty: SAMPLE_STATE.policy.stampDuty,
      },
      timeline: SAMPLE_STATE.timeline,
      includeStampDutyInCash: true,
    };

    const s = normalizeState(oldState);

    // Backfilled from defaults:
    expect(s.policy.loan.msr).toBe(DEFAULT_POLICY.loan.msr);
    expect(s.policy.loan.tdsr).toBe(DEFAULT_POLICY.loan.tdsr);
    expect(s.policy.loan.hdbStressRatePct).toBe(DEFAULT_POLICY.loan.hdbStressRatePct);
    expect(s.policy.loan.bankStressRatePct).toBe(DEFAULT_POLICY.loan.bankStressRatePct);
    expect(s.household.monthlyDebtObligations).toBe(0);

    // Preserved user values:
    expect(s.household.buyer1.monthlyIncome).toBe(7000);
    expect(s.flat.loanType).toBe("BANK");
    expect(s.policy.loan.bankMinCashFraction).toBe(0.05);
  });

  it("returns full defaults for empty / garbage input", () => {
    const s = normalizeState(undefined);
    expect(s.policy.loan).toEqual(DEFAULT_POLICY.loan);
    expect(s.household.monthlyDebtObligations).toBe(0);
    expect(s.timeline.length).toBe(SAMPLE_STATE.timeline.length);
  });
});
