// Pure loan / contribution calculation helpers. No React, no side effects — fully unit-tested.

import type { FlatInputs, HouseholdInputs, LoanPolicyConfig, SplitConfig } from "@/types/hdb";

/**
 * Standard amortising monthly payment.
 * principal: loan amount; annualInterestRate: percent (e.g. 2.6); tenureYears: years.
 * Handles 0% interest (straight-line) and guards against invalid inputs.
 */
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  tenureYears: number,
): number {
  if (principal <= 0 || tenureYears <= 0) return 0;
  const n = tenureYears * 12;
  const r = annualInterestRate / 100 / 12;
  if (r === 0) return principal / n;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

/**
 * Present value of an annuity: the maximum loan whose monthly repayment equals `monthlyPayment`,
 * at `annualInterestRate`% over `tenureYears`. Inverse of calculateMonthlyPayment.
 */
export function presentValueOfAnnuity(
  monthlyPayment: number,
  annualInterestRate: number,
  tenureYears: number,
): number {
  if (monthlyPayment <= 0 || tenureYears <= 0) return 0;
  const n = tenureYears * 12;
  const r = annualInterestRate / 100 / 12;
  if (r === 0) return monthlyPayment * n;
  return (monthlyPayment * (1 - Math.pow(1 + r, -n))) / r;
}

export type BindingRatio = "MSR" | "TDSR";

export interface BorrowingCapacity {
  /** Gross monthly income used for this computation. */
  grossMonthlyIncome: number;
  /** Max monthly repayment allowed by MSR (30% of income). */
  msrMonthlyCap: number;
  /** Max monthly repayment allowed by TDSR (55% of income minus other debts). Bank loans only. */
  tdsrMonthlyCap: number;
  /** The binding monthly repayment cap actually applied. */
  monthlyRepaymentCap: number;
  /** Which ratio binds the monthly cap. */
  bindingRatio: BindingRatio;
  /** Stress-test rate used to size the loan from the monthly cap. */
  stressRatePct: number;
  /** Maximum loan supportable by income at the stress rate over the tenure. */
  maxLoanFromIncome: number;
}

/**
 * How much can be borrowed from income alone, via MSR/TDSR.
 *
 * - HDB loans are subject to MSR only (30%).
 * - Bank loans (for HDB flats) are subject to the lower of MSR (30%) and TDSR (55% − other debts).
 * The eligible loan is sized at the stress-test / medium-term rate, not the actual rate.
 */
export function computeBorrowingCapacity(
  grossMonthlyIncome: number,
  otherMonthlyDebts: number,
  loanType: FlatInputs["loanType"],
  tenureYears: number,
  loan: LoanPolicyConfig,
): BorrowingCapacity {
  const income = Math.max(0, grossMonthlyIncome);
  const msrMonthlyCap = loan.msr * income;
  const tdsrMonthlyCap = Math.max(0, loan.tdsr * income - Math.max(0, otherMonthlyDebts));

  // HDB loans: MSR only. Bank loans: lower of MSR and TDSR.
  const isHdb = loanType === "HDB";
  const monthlyRepaymentCap = isHdb
    ? msrMonthlyCap
    : Math.min(msrMonthlyCap, tdsrMonthlyCap);
  const bindingRatio: BindingRatio =
    isHdb || msrMonthlyCap <= tdsrMonthlyCap ? "MSR" : "TDSR";

  const stressRatePct = isHdb ? loan.hdbStressRatePct : loan.bankStressRatePct;
  const maxLoanFromIncome = presentValueOfAnnuity(
    monthlyRepaymentCap,
    stressRatePct,
    tenureYears,
  );

  return {
    grossMonthlyIncome: income,
    msrMonthlyCap,
    tdsrMonthlyCap,
    monthlyRepaymentCap,
    bindingRatio,
    stressRatePct,
    maxLoanFromIncome,
  };
}

/** Total interest paid over the tenure = (monthly * months) - principal. */
export function calculateTotalInterest(
  principal: number,
  monthlyPayment: number,
  tenureYears: number,
): number {
  if (principal <= 0 || tenureYears <= 0) return 0;
  return Math.max(0, monthlyPayment * tenureYears * 12 - principal);
}

/** Cash-over-valuation = max(0, price - valuation). COV must always be paid in cash. */
export function calculateCashOverValuation(price: number, valuation: number): number {
  return Math.max(0, price - valuation);
}

/** Split two incomes into percentages that sum to 100. Guards divide-by-zero (defaults to 50/50). */
export function calculateIncomeRatioSplit(
  buyer1Income: number,
  buyer2Income: number,
): { buyer1Pct: number; buyer2Pct: number } {
  const total = buyer1Income + buyer2Income;
  if (total <= 0) return { buyer1Pct: 50, buyer2Pct: 50 };
  const buyer1Pct = (buyer1Income / total) * 100;
  return { buyer1Pct, buyer2Pct: 100 - buyer1Pct };
}

/** A buyer's share of a total amount given their split percentage (0-100). */
export function calculateLoanShare(totalLoan: number, splitPercent: number): number {
  return totalLoan * (splitPercent / 100);
}

/**
 * How much CPF OA can be used toward a required contribution.
 * Returns the CPF used (capped at available) and any remaining cash shortfall.
 */
export function calculateCPFUsage(
  availableCpf: number,
  requiredContribution: number,
): { cpfUsed: number; cashShortfall: number } {
  const cpfUsed = Math.max(0, Math.min(availableCpf, requiredContribution));
  return { cpfUsed, cashShortfall: Math.max(0, requiredContribution - cpfUsed) };
}

/** Resolve the effective buyer-1 / buyer-2 split percentages from the chosen split mode. */
export function resolveSplitPercents(
  split: SplitConfig,
  household: HouseholdInputs,
): { buyer1Pct: number; buyer2Pct: number } {
  switch (split.mode) {
    case "EQUAL":
      return { buyer1Pct: 50, buyer2Pct: 50 };
    case "INCOME":
      return calculateIncomeRatioSplit(
        household.buyer1.monthlyIncome,
        household.buyer2.monthlyIncome,
      );
    case "CUSTOM": {
      const b1 = clamp(split.customBuyer1Pct, 0, 100);
      return { buyer1Pct: b1, buyer2Pct: 100 - b1 };
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type LoanBindingConstraint = "LTV" | "MSR" | "TDSR";

export interface LoanSummary {
  /** Higher of price/valuation drives BSD; lower drives the loan ceiling. */
  lowerOfPriceValuation: number;
  cashOverValuation: number;
  /** Effective maximum loan = the lower of the LTV cap and the income cap. */
  maxLoan: number;
  /** Maximum loan permitted by the LTV limit alone. */
  ltvCappedLoan: number;
  /** Maximum loan supportable by income (MSR/TDSR) alone. */
  incomeCappedLoan: number;
  /** Which limit actually binds the loan. */
  bindingConstraint: LoanBindingConstraint;
  /** Borrowing-capacity detail for the household income. */
  capacity: BorrowingCapacity;
  /** Downpayment = price-related cost not covered by the loan (excludes COV double count). */
  downpayment: number;
  /** Portion of downpayment that must be cash (bank min-cash rule); 0 for HDB loans. */
  downpaymentMinCash: number;
  /** Portion of downpayment that may be paid by CPF OA or cash. */
  downpaymentCpfOrCash: number;
  monthlyInstalment: number;
  totalInterest: number;
  ltvUsed: number;
}

/**
 * Aggregate the core loan picture.
 *
 * The loan ceiling is LTV × (lower of price/valuation). The buyer must fund the rest:
 * the downpayment on the valued portion plus any cash-over-valuation (always cash).
 */
export function computeLoanSummary(
  flat: FlatInputs,
  loan: LoanPolicyConfig,
  grossMonthlyIncome: number,
  otherMonthlyDebts: number,
): LoanSummary {
  const lower = Math.min(flat.resalePrice, flat.valuation);
  const cov = calculateCashOverValuation(flat.resalePrice, flat.valuation);
  const ltvUsed = flat.loanType === "HDB" ? loan.hdbLtv : loan.bankLtv;

  const ltvCappedLoan = Math.max(0, lower * ltvUsed);
  const capacity = computeBorrowingCapacity(
    grossMonthlyIncome,
    otherMonthlyDebts,
    flat.loanType,
    flat.tenureYears,
    loan,
  );
  const incomeCappedLoan = capacity.maxLoanFromIncome;

  // The realistic loan is the lower of the LTV cap and the income (MSR/TDSR) cap.
  const maxLoan = Math.min(ltvCappedLoan, incomeCappedLoan);
  const bindingConstraint: LoanBindingConstraint =
    incomeCappedLoan < ltvCappedLoan ? capacity.bindingRatio : "LTV";

  // Downpayment on the valued portion (the part the loan does not cover).
  const downpaymentOnValuation = Math.max(0, lower - maxLoan);

  // Bank loans require a minimum cash component of the downpayment; HDB loans allow full CPF.
  const minCash =
    flat.loanType === "BANK" ? lower * loan.bankMinCashFraction : 0;
  const downpaymentMinCash = Math.min(minCash, downpaymentOnValuation);
  const downpaymentCpfOrCash = Math.max(0, downpaymentOnValuation - downpaymentMinCash);

  const monthlyInstalment = calculateMonthlyPayment(
    maxLoan,
    flat.interestRatePct,
    flat.tenureYears,
  );
  const totalInterest = calculateTotalInterest(maxLoan, monthlyInstalment, flat.tenureYears);

  return {
    lowerOfPriceValuation: lower,
    cashOverValuation: cov,
    maxLoan,
    ltvCappedLoan,
    incomeCappedLoan,
    bindingConstraint,
    capacity,
    // Total downpayment the buyer funds = valued-portion downpayment + cash-over-valuation.
    downpayment: downpaymentOnValuation + cov,
    downpaymentMinCash: downpaymentMinCash + cov, // COV is always cash
    downpaymentCpfOrCash,
    monthlyInstalment,
    totalInterest,
    ltvUsed,
  };
}

export interface BuyerBreakdown {
  name: string;
  income: number;
  incomeSharePct: number;
  splitPct: number;
  cpfOaUsed: number;
  cashNeeded: number;
  loanResponsibility: number;
  monthlyInstalmentShare: number;
}

/**
 * Per-buyer contribution breakdown.
 *
 * Each buyer is responsible for their split share of the loan and the downpayment.
 * CPF OA covers the CPF-eligible portion of their downpayment share first; the rest is cash.
 * The min-cash portion (bank loans) and any cash-over-valuation are always cash.
 */
export function computeBuyerBreakdowns(
  household: HouseholdInputs,
  loanSummary: LoanSummary,
  split: SplitConfig,
): BuyerBreakdown[] {
  const { buyer1Pct, buyer2Pct } = resolveSplitPercents(split, household);
  const incomeSplit = calculateIncomeRatioSplit(
    household.buyer1.monthlyIncome,
    household.buyer2.monthlyIncome,
  );

  const build = (
    buyerKey: "buyer1" | "buyer2",
    splitPct: number,
    incomeSharePct: number,
  ): BuyerBreakdown => {
    const buyer = household[buyerKey];
    const cpfEligibleShare = loanSummary.downpaymentCpfOrCash * (splitPct / 100);
    const cashOnlyShare = loanSummary.downpaymentMinCash * (splitPct / 100);
    const { cpfUsed, cashShortfall } = calculateCPFUsage(
      buyer.cpfOaAvailable,
      cpfEligibleShare,
    );
    return {
      name: buyer.name,
      income: buyer.monthlyIncome,
      incomeSharePct,
      splitPct,
      cpfOaUsed: cpfUsed,
      cashNeeded: cashShortfall + cashOnlyShare,
      loanResponsibility: calculateLoanShare(loanSummary.maxLoan, splitPct),
      monthlyInstalmentShare: calculateLoanShare(loanSummary.monthlyInstalment, splitPct),
    };
  };

  return [
    build("buyer1", buyer1Pct, incomeSplit.buyer1Pct),
    build("buyer2", buyer2Pct, incomeSplit.buyer2Pct),
  ];
}
