// Buyer's Stamp Duty (BSD) and Additional Buyer's Stamp Duty (ABSD) estimators.
// Pure functions driven by editable StampDutyConfig. Estimates only — confirm with IRAS.

import type { Citizenship, FlatInputs, HouseholdInputs, StampDutyConfig } from "@/types/hdb";

export type AbsdBuyerProfile = Citizenship | "NONE";

export interface AbsdAssessmentInput {
  /** Higher of price/valuation. */
  dutiableValue: number;
  buyer1: Citizenship;
  /** Second buyer, or "NONE" for a single buyer. */
  buyer2: AbsdBuyerProfile;
  isMarried: boolean;
  /** Residential properties the household already owns (before this purchase). */
  propertiesOwnedBefore: number;
  /** For a married SC couple buying a replacement home: intend to sell the existing one in time. */
  willSellFirstProperty: boolean;
}

export type RemissionType = "none" | "full" | "refund";

export interface AbsdAssessment {
  propertyCountAfter: number;
  /** The citizenship profile whose rate applies (the highest among the buyers). */
  applicableProfile: Citizenship;
  rate: number;
  grossAbsd: number;
  remission: RemissionType;
  /** ABSD actually payable upfront after applying full remission (refund cases still pay upfront). */
  netAbsd: number;
  notes: string[];
}

/**
 * Assess ABSD for one or two buyers, including the married-couple remissions.
 *
 * - Full remission: a married couple with at least one Singapore Citizen buying their FIRST
 *   residential property jointly pays no ABSD.
 * - Refund: a married SC couple buying a SECOND property may claim a refund if they sell their
 *   first residential property within the qualifying period — ABSD is still paid upfront.
 */
export function assessAbsd(
  input: AbsdAssessmentInput,
  config: StampDutyConfig,
): AbsdAssessment {
  const propertyCountAfter = Math.max(1, input.propertiesOwnedBefore + 1);
  const rate1 = absdRateFor(input.buyer1, propertyCountAfter, config);
  const rate2 =
    input.buyer2 === "NONE"
      ? 0
      : absdRateFor(input.buyer2, propertyCountAfter, config);
  const rate = Math.max(rate1, rate2);
  const applicableProfile: Citizenship =
    input.buyer2 !== "NONE" && rate2 > rate1 ? input.buyer2 : input.buyer1;

  const grossAbsd = Math.max(0, input.dutiableValue) * rate;

  const isCouple = input.buyer2 !== "NONE" && input.isMarried;
  const hasSc = input.buyer1 === "SC" || input.buyer2 === "SC";

  let remission: RemissionType = "none";
  const notes: string[] = [];

  if (isCouple && hasSc) {
    if (propertyCountAfter === 1) {
      remission = "full";
      notes.push(
        "Full ABSD remission: a married couple with at least one Singapore Citizen buying their first residential property jointly pays no ABSD.",
      );
    } else if (propertyCountAfter === 2 && input.willSellFirstProperty) {
      remission = "refund";
      notes.push(
        "ABSD refund possible: a married SC couple buying a second property can claim a refund if they sell their first residential property within the qualifying period (currently 6 months of purchase, for completed properties). ABSD must still be paid upfront.",
      );
    } else if (propertyCountAfter >= 2) {
      notes.push(
        "Owning another residential property: ABSD applies. A refund is only possible if you sell your existing property within the qualifying period.",
      );
    }
  } else if (input.buyer2 !== "NONE" && !input.isMarried && hasSc) {
    notes.push(
      "Married-couple ABSD remission requires the buyers to be legally married and to buy jointly. As an unmarried pair, the higher buyer's ABSD rate applies.",
    );
  }

  if (rate === 0 && remission === "none") {
    notes.push("No ABSD applies to this profile for this property count.");
  }

  return {
    propertyCountAfter,
    applicableProfile,
    rate,
    grossAbsd,
    remission,
    netAbsd: remission === "full" ? 0 : grossAbsd,
    notes,
  };
}

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
