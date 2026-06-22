import { describe, expect, it } from "vitest";
import {
  calculateCPFUsage,
  calculateCashOverValuation,
  calculateIncomeRatioSplit,
  calculateLoanShare,
  calculateMonthlyPayment,
  calculateTotalInterest,
  computeBuyerBreakdowns,
  computeLoanSummary,
  resolveSplitPercents,
} from "@/lib/hdbCalculations";
import { DEFAULT_POLICY, SAMPLE_STATE } from "@/lib/constants";
import type { FlatInputs } from "@/types/hdb";

describe("calculateMonthlyPayment", () => {
  it("handles 0% interest as straight-line repayment", () => {
    expect(calculateMonthlyPayment(120000, 0, 10)).toBeCloseTo(1000, 5);
  });

  it("computes a standard amortising payment", () => {
    // $300k at 3% over 30 years ≈ $1,264.81/month.
    expect(calculateMonthlyPayment(300000, 3, 30)).toBeCloseTo(1264.81, 1);
  });

  it("returns 0 for non-positive principal or tenure", () => {
    expect(calculateMonthlyPayment(0, 2.6, 25)).toBe(0);
    expect(calculateMonthlyPayment(100000, 2.6, 0)).toBe(0);
  });
});

describe("calculateTotalInterest", () => {
  it("is months * payment minus principal", () => {
    const monthly = calculateMonthlyPayment(300000, 3, 30);
    expect(calculateTotalInterest(300000, monthly, 30)).toBeCloseTo(monthly * 360 - 300000, 4);
  });

  it("is 0 at 0% interest", () => {
    const monthly = calculateMonthlyPayment(120000, 0, 10);
    expect(calculateTotalInterest(120000, monthly, 10)).toBeCloseTo(0, 4);
  });
});

describe("calculateCashOverValuation", () => {
  it("is the positive gap between price and valuation", () => {
    expect(calculateCashOverValuation(600000, 580000)).toBe(20000);
  });
  it("is 0 when valuation meets or exceeds price", () => {
    expect(calculateCashOverValuation(580000, 600000)).toBe(0);
  });
});

describe("calculateIncomeRatioSplit", () => {
  it("splits proportionally to income", () => {
    const { buyer1Pct, buyer2Pct } = calculateIncomeRatioSplit(6000, 4500);
    expect(buyer1Pct).toBeCloseTo(57.142, 2);
    expect(buyer2Pct).toBeCloseTo(42.857, 2);
    expect(buyer1Pct + buyer2Pct).toBeCloseTo(100, 6);
  });
  it("falls back to 50/50 when both incomes are 0", () => {
    expect(calculateIncomeRatioSplit(0, 0)).toEqual({ buyer1Pct: 50, buyer2Pct: 50 });
  });
});

describe("calculateLoanShare", () => {
  it("returns the percentage share of the total", () => {
    expect(calculateLoanShare(400000, 25)).toBe(100000);
  });
});

describe("calculateCPFUsage", () => {
  it("caps CPF at the amount available", () => {
    expect(calculateCPFUsage(30000, 50000)).toEqual({ cpfUsed: 30000, cashShortfall: 20000 });
  });
  it("uses only what is required when CPF is ample", () => {
    expect(calculateCPFUsage(80000, 50000)).toEqual({ cpfUsed: 50000, cashShortfall: 0 });
  });
});

describe("resolveSplitPercents", () => {
  it("returns 50/50 for EQUAL", () => {
    expect(
      resolveSplitPercents({ mode: "EQUAL", customBuyer1Pct: 70 }, SAMPLE_STATE.household),
    ).toEqual({ buyer1Pct: 50, buyer2Pct: 50 });
  });
  it("uses the custom percentage and complements it", () => {
    expect(
      resolveSplitPercents({ mode: "CUSTOM", customBuyer1Pct: 70 }, SAMPLE_STATE.household),
    ).toEqual({ buyer1Pct: 70, buyer2Pct: 30 });
  });
});

describe("computeLoanSummary", () => {
  it("computes the HDB loan picture for the sample flat", () => {
    const s = computeLoanSummary(SAMPLE_STATE.flat, DEFAULT_POLICY.loan);
    expect(s.lowerOfPriceValuation).toBe(580000);
    expect(s.cashOverValuation).toBe(20000);
    expect(s.maxLoan).toBe(435000); // 75% of 580k
    expect(s.downpayment).toBe(165000); // 145k valued downpayment + 20k COV
    expect(s.downpaymentMinCash).toBe(20000); // HDB: only COV is forced cash
    expect(s.downpaymentCpfOrCash).toBe(145000);
    expect(s.monthlyInstalment).toBeCloseTo(1973.43, 1);
  });

  it("applies the bank min-cash rule", () => {
    const bankFlat: FlatInputs = { ...SAMPLE_STATE.flat, loanType: "BANK" };
    const s = computeLoanSummary(bankFlat, DEFAULT_POLICY.loan);
    // 5% of 580k = 29k min cash, plus 20k COV.
    expect(s.downpaymentMinCash).toBe(49000);
    expect(s.downpaymentCpfOrCash).toBe(116000);
  });
});

describe("computeBuyerBreakdowns", () => {
  it("splits loan responsibility by income ratio and sums to the total loan", () => {
    const s = computeLoanSummary(SAMPLE_STATE.flat, DEFAULT_POLICY.loan);
    const [b1, b2] = computeBuyerBreakdowns(SAMPLE_STATE.household, s, SAMPLE_STATE.split);
    expect(b1.loanResponsibility + b2.loanResponsibility).toBeCloseTo(s.maxLoan, 4);
    expect(b1.monthlyInstalmentShare + b2.monthlyInstalmentShare).toBeCloseTo(
      s.monthlyInstalment,
      4,
    );
    expect(b1.splitPct).toBeGreaterThan(b2.splitPct); // buyer 1 earns more
  });
});
