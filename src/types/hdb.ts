// Domain types for the HDB Buyer Loan & Grant Dashboard.
// These describe the shape of user inputs and the editable policy configuration.

export type Citizenship = "SC" | "SPR" | "FOREIGNER";

export type FlatType = "2-room" | "3-room" | "4-room" | "5-room" | "Executive";

export type ChildrenCitizenship = "ALL_SC" | "SOME_SC" | "NONE_SC";

export type FirstTimerStatus =
  | "BOTH_FIRST"
  | "ONE_FIRST_ONE_SECOND"
  | "BOTH_SECOND";

export type ProximityStatus = "NONE" | "WITHIN_4KM" | "LIVING_WITH";

export type LoanType = "HDB" | "BANK";

export type SplitMode = "EQUAL" | "INCOME" | "CUSTOM";

export type MilestoneStatus = "pending" | "in-progress" | "done";

export interface Buyer {
  name: string;
  citizenship: Citizenship;
  monthlyIncome: number;
  cpfOaAvailable: number;
  age: number;
}

export interface HouseholdInputs {
  buyer1: Buyer;
  buyer2: Buyer;
  numChildren: number;
  childrenCitizenship: ChildrenCitizenship;
  firstTimerStatus: FirstTimerStatus;
  proximity: ProximityStatus;
  /** Whether the SPR spouse intends to take up citizenship (affects Citizen Top-Up). */
  sprWillBecomeSc: boolean;
}

export interface FlatInputs {
  resalePrice: number;
  valuation: number;
  flatType: FlatType;
  remainingLeaseYears: number;
  loanType: LoanType;
  interestRatePct: number;
  tenureYears: number;
  /** Number of properties this household will own after purchase (drives ABSD tier). */
  propertyCount: number;
}

export interface SplitConfig {
  mode: SplitMode;
  /** Buyer 1 percentage used when mode === "CUSTOM" (0-100). */
  customBuyer1Pct: number;
}

// ---- Editable policy configuration (so policy changes need no code edits) ----

export interface LoanPolicyConfig {
  /** Loan-to-value limit for HDB loans, as a fraction (e.g. 0.75). */
  hdbLtv: number;
  /** Loan-to-value limit for bank loans, as a fraction. */
  bankLtv: number;
  /** Minimum cash portion of the downpayment for bank loans, as a fraction of price/valuation. */
  bankMinCashFraction: number;
}

export interface EhgIncomeBand {
  /** Inclusive upper bound of average gross monthly household income for this band. */
  maxIncome: number;
  /** Grant amount for this band. */
  grant: number;
}

export interface GrantConfig {
  familyGrantScSc: { smallFlat: number; largeFlat: number };
  familyGrantScSpr: { smallFlat: number; largeFlat: number };
  citizenTopUp: number;
  proximityLivingWith: number;
  proximityWithin4km: number;
  /** EHG income ceiling (average gross monthly household income). */
  ehgIncomeCeiling: number;
  ehgBands: EhgIncomeBand[];
}

export interface StampDutyBracket {
  /** Width of this bracket in dollars; use Infinity for the final, open-ended bracket. */
  upTo: number;
  rate: number;
}

export interface AbsdRates {
  /** SC buyer's ABSD rate by number of residential properties owned (index 0 = first). */
  sc: number[];
  spr: number[];
  foreigner: number[];
}

export interface StampDutyConfig {
  bsdBrackets: StampDutyBracket[];
  absd: AbsdRates;
}

export interface PolicyConfig {
  loan: LoanPolicyConfig;
  grant: GrantConfig;
  stampDuty: StampDutyConfig;
}

export interface TimelineMilestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  date: string; // ISO yyyy-mm-dd, empty when unset
  done: boolean;
}

export interface AppState {
  household: HouseholdInputs;
  flat: FlatInputs;
  split: SplitConfig;
  policy: PolicyConfig;
  timeline: TimelineMilestone[];
  includeStampDutyInCash: boolean;
}
