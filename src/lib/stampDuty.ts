// Buyer's Stamp Duty (BSD) and Additional Buyer's Stamp Duty (ABSD) estimators.
// Pure functions driven by editable StampDutyConfig. Estimates only — confirm with IRAS.

import type { Citizenship, FlatInputs, HouseholdInputs, StampDutyConfig } from "@/types/hdb";

/** BSD is charged on the higher of purchase price or market value. */
function dutiableValue(flat: FlatInputs): number {
  return Math.max(flat.resalePrice, flat.valuation);
}

/** Progressive Buyer's Stamp Duty across the configured brackets. */
export function calculateBsd(value: number, config: StampDutyConfig): number {
  if (value <= 0) return 0;
  let remaining = value;
  let bsd = 0;
  for (const bracket of config.bsdBrackets) {
    if (remaining <= 0) break;
    const slice = Math.min(remaining, bracket.upTo);
    bsd += slice * bracket.rate;
    remaining -= slice;
  }
  return bsd;
}

/**
 * ABSD rate for a buyer, by citizenship and number of residential properties owned
 * after this purchase (1 = first property). Falls back to the highest configured tier.
 */
export function absdRateFor(
  citizenship: Citizenship,
  propertyCount: number,
  config: StampDutyConfig,
): number {
  const table =
    citizenship === "SC"
      ? config.absd.sc
      : citizenship === "SPR"
        ? config.absd.spr
        : config.absd.foreigner;
  const index = Math.max(0, Math.min(propertyCount - 1, table.length - 1));
  return table[index] ?? table[table.length - 1] ?? 0;
}

export interface StampDutyResult {
  dutiableValue: number;
  bsd: number;
  /** ABSD is assessed on the buyer with the higher applicable rate (the conservative profile). */
  absd: number;
  absdRate: number;
  absdProfile: Citizenship;
  total: number;
  remissionNote: boolean;
}

/**
 * Estimate total stamp duty. BSD applies to the dutiable value once.
 * For a couple, ABSD is assessed at the higher of the two buyers' profile rates
 * (the conservative assumption); married SC/SPR couples may qualify for remission.
 */
export function estimateStampDuty(
  household: HouseholdInputs,
  flat: FlatInputs,
  config: StampDutyConfig,
): StampDutyResult {
  const value = dutiableValue(flat);
  const bsd = calculateBsd(value, config);

  const rate1 = absdRateFor(household.buyer1.citizenship, flat.propertyCount, config);
  const rate2 = absdRateFor(household.buyer2.citizenship, flat.propertyCount, config);
  const absdRate = Math.max(rate1, rate2);
  const absdProfile =
    rate1 >= rate2 ? household.buyer1.citizenship : household.buyer2.citizenship;
  const absd = value * absdRate;

  // Married SC/SPR (incl. SC+SPR) couples buying their only home may get ABSD remission.
  const pairHasSc =
    household.buyer1.citizenship === "SC" || household.buyer2.citizenship === "SC";
  const remissionNote = pairHasSc && absdRate > 0 && flat.propertyCount <= 1;

  return {
    dutiableValue: value,
    bsd,
    absd,
    absdRate,
    absdProfile,
    total: bsd + absd,
    remissionNote,
  };
}
