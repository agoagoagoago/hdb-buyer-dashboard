// CPF housing grant estimators. Pure functions driven by editable GrantConfig.
// IMPORTANT: estimates only — final eligibility & quantum are determined by HDB/CPF.

import type { FlatInputs, GrantConfig, HouseholdInputs } from "@/types/hdb";

/** A 5-room or larger flat receives the "large flat" (lower) Family Grant tier. */
function isLargeFlat(flat: FlatInputs): boolean {
  return flat.flatType === "5-room" || flat.flatType === "Executive";
}

function bothFirstTimers(household: HouseholdInputs): boolean {
  return household.firstTimerStatus === "BOTH_FIRST";
}

function citizenshipPair(household: HouseholdInputs): "SC_SC" | "SC_SPR" | "OTHER" {
  const a = household.buyer1.citizenship;
  const b = household.buyer2.citizenship;
  const set = new Set([a, b]);
  if (set.size === 1 && set.has("SC")) return "SC_SC";
  if (set.has("SC") && set.has("SPR") && !set.has("FOREIGNER")) return "SC_SPR";
  return "OTHER";
}

export interface GrantResult {
  familyGrant: number;
  enhancedGrant: number;
  proximityGrant: number;
  citizenTopUp: number;
  total: number;
  warnings: string[];
}

/** Family / CPF Housing Grant for first-timer SC+SC or SC+SPR families. */
export function estimateFamilyGrant(
  household: HouseholdInputs,
  flat: FlatInputs,
  config: GrantConfig,
): number {
  if (!bothFirstTimers(household)) return 0;
  const pair = citizenshipPair(household);
  const large = isLargeFlat(flat);
  if (pair === "SC_SC") {
    return large ? config.familyGrantScSc.largeFlat : config.familyGrantScSc.smallFlat;
  }
  if (pair === "SC_SPR") {
    return large ? config.familyGrantScSpr.largeFlat : config.familyGrantScSpr.smallFlat;
  }
  return 0;
}

/** Citizen Top-Up: SC+SPR family with an SC child (or SPR spouse intending to convert). */
export function estimateCitizenTopUp(
  household: HouseholdInputs,
  config: GrantConfig,
): number {
  if (citizenshipPair(household) !== "SC_SPR") return 0;
  const hasScChild =
    household.numChildren > 0 &&
    (household.childrenCitizenship === "ALL_SC" ||
      household.childrenCitizenship === "SOME_SC");
  if (hasScChild || household.sprWillBecomeSc) return config.citizenTopUp;
  return 0;
}

/** Proximity Housing Grant: living with parents / within 4km. */
export function estimateProximityGrant(
  household: HouseholdInputs,
  config: GrantConfig,
): number {
  switch (household.proximity) {
    case "LIVING_WITH":
      return config.proximityLivingWith;
    case "WITHIN_4KM":
      return config.proximityWithin4km;
    default:
      return 0;
  }
}

/**
 * Enhanced CPF Housing Grant (EHG) estimate.
 * Uses an editable income-band table. Returns 0 above the income ceiling or for non-first-timers.
 * This is an estimate only; the official EHG depends on HDB's income assessment.
 */
export function estimateEHG(
  household: HouseholdInputs,
  config: GrantConfig,
): number {
  if (!bothFirstTimers(household)) return 0;
  if (citizenshipPair(household) === "OTHER") return 0;
  const householdIncome =
    household.buyer1.monthlyIncome + household.buyer2.monthlyIncome;
  if (householdIncome > config.ehgIncomeCeiling) return 0;
  // Bands are inclusive upper bounds, assumed sorted ascending.
  const band = [...config.ehgBands]
    .sort((a, b) => a.maxIncome - b.maxIncome)
    .find((b) => householdIncome <= b.maxIncome);
  return band ? band.grant : 0;
}

/** Build any eligibility warnings to surface to the user instead of silently returning $0. */
export function buildGrantWarnings(household: HouseholdInputs): string[] {
  const warnings: string[] = [];
  const pair = citizenshipPair(household);

  if (
    household.buyer1.citizenship === "FOREIGNER" ||
    household.buyer2.citizenship === "FOREIGNER"
  ) {
    warnings.push(
      "A foreigner co-applicant generally cannot buy a resale HDB flat or receive CPF housing grants. Verify eligibility with HDB.",
    );
  }
  if (pair === "OTHER" && household.buyer2.citizenship !== "FOREIGNER") {
    warnings.push(
      "This citizenship combination may not qualify for the standard Family Grant. Verify your eligibility scheme with HDB.",
    );
  }
  if (!bothFirstTimers(household)) {
    warnings.push(
      "Second-timer applicants face different (often lower or no) grant amounts and may incur a resale levy. Family Grant/EHG shown assume first-timers only.",
    );
  }
  if (pair === "SC_SPR") {
    warnings.push(
      "SC+SPR families qualify under the Non-Citizen Spouse / SPR schemes. The Citizen Top-Up applies only if there is an SC child or the SPR spouse becomes an SC.",
    );
  }
  return warnings;
}

/** Total estimated grants plus the component breakdown and warnings. */
export function estimateTotalGrants(
  household: HouseholdInputs,
  flat: FlatInputs,
  config: GrantConfig,
): GrantResult {
  const familyGrant = estimateFamilyGrant(household, flat, config);
  const enhancedGrant = estimateEHG(household, config);
  const proximityGrant = estimateProximityGrant(household, config);
  const citizenTopUp = estimateCitizenTopUp(household, config);
  return {
    familyGrant,
    enhancedGrant,
    proximityGrant,
    citizenTopUp,
    total: familyGrant + enhancedGrant + proximityGrant + citizenTopUp,
    warnings: buildGrantWarnings(household),
  };
}
