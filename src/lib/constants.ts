// Default sample household and editable default policy configuration.
// All dollar amounts / rates live here (and in PolicyConfig) so policy changes need no logic edits.

import type {
  AppState,
  EhgIncomeBand,
  PolicyConfig,
  TimelineMilestone,
} from "@/types/hdb";

export const APP_TITLE = "HDB Buyer Loan & Grant Dashboard";
export const STORAGE_KEY = "hdb-buyer-dashboard.v1";

// Enhanced CPF Housing Grant (EHG) family bands: $120k down to $45k in $5k steps per $500 income band.
// Reflects the 2024 EHG enhancement (income ceiling $9,000). Editable in the Assumptions panel.
function buildEhgBands(): EhgIncomeBand[] {
  const bands: EhgIncomeBand[] = [{ maxIncome: 1500, grant: 120000 }];
  let grant = 120000;
  for (let upper = 2000; upper <= 9000; upper += 500) {
    grant -= 5000;
    bands.push({ maxIncome: upper, grant });
  }
  return bands;
}

export const DEFAULT_POLICY: PolicyConfig = {
  loan: {
    hdbLtv: 0.75,
    bankLtv: 0.75,
    bankMinCashFraction: 0.05,
  },
  grant: {
    familyGrantScSc: { smallFlat: 80000, largeFlat: 50000 },
    familyGrantScSpr: { smallFlat: 70000, largeFlat: 40000 },
    citizenTopUp: 10000,
    proximityLivingWith: 30000,
    proximityWithin4km: 20000,
    ehgIncomeCeiling: 9000,
    ehgBands: buildEhgBands(),
  },
  stampDuty: {
    // Buyer's Stamp Duty (residential) progressive brackets.
    bsdBrackets: [
      { upTo: 180000, rate: 0.01 },
      { upTo: 180000, rate: 0.02 },
      { upTo: 640000, rate: 0.03 },
      { upTo: 500000, rate: 0.04 },
      { upTo: 1500000, rate: 0.05 },
      { upTo: Infinity, rate: 0.06 },
    ],
    // ABSD rates by property count (index 0 = 1st property). Reflects rates from Apr 2023.
    absd: {
      sc: [0, 0.2, 0.3],
      spr: [0.05, 0.3, 0.35],
      foreigner: [0.6, 0.6, 0.6],
    },
  },
};

export const SAMPLE_TIMELINE: TimelineMilestone[] = [
  {
    id: "hfe",
    title: "Apply for HFE letter",
    description: "Get your HDB Flat Eligibility letter to confirm grants, loan eligibility & limits.",
    status: "pending",
    date: "",
    done: false,
  },
  {
    id: "intent-sell",
    title: "Seller registers Intent to Sell",
    description: "The seller registers their intent before granting an Option to Purchase.",
    status: "pending",
    date: "",
    done: false,
  },
  {
    id: "negotiate",
    title: "Negotiate price",
    description: "Agree on the resale price with the seller.",
    status: "pending",
    date: "",
    done: false,
  },
  {
    id: "otp-grant",
    title: "Seller grants OTP",
    description: "Seller grants the Option to Purchase; buyer pays the option fee.",
    status: "pending",
    date: "",
    done: false,
  },
  {
    id: "request-value",
    title: "Buyer submits Request for Value",
    description: "Submit a Request for Value to HDB to confirm the flat's valuation.",
    status: "pending",
    date: "",
    done: false,
  },
  {
    id: "otp-exercise",
    title: "Buyer exercises OTP",
    description: "Pay the option exercise fee and exercise the Option to Purchase.",
    status: "pending",
    date: "",
    done: false,
  },
  {
    id: "resale-application",
    title: "Submit resale application",
    description: "Buyer and seller each submit their portion of the resale application.",
    status: "pending",
    date: "",
    done: false,
  },
  {
    id: "endorsement",
    title: "HDB endorsement",
    description: "Both parties endorse documents and acknowledge fees payable.",
    status: "pending",
    date: "",
    done: false,
  },
  {
    id: "approval",
    title: "HDB resale approval",
    description: "HDB approves the resale transaction.",
    status: "pending",
    date: "",
    done: false,
  },
  {
    id: "inspection",
    title: "Final inspection",
    description: "Inspect the flat before completion.",
    status: "pending",
    date: "",
    done: false,
  },
  {
    id: "completion",
    title: "Completion appointment",
    description: "Attend the completion appointment at HDB; pay the balance.",
    status: "pending",
    date: "",
    done: false,
  },
  {
    id: "handover",
    title: "Key handover",
    description: "Collect the keys to your new flat.",
    status: "pending",
    date: "",
    done: false,
  },
];

export const SAMPLE_STATE: AppState = {
  household: {
    buyer1: {
      name: "Buyer 1",
      citizenship: "SC",
      monthlyIncome: 6000,
      cpfOaAvailable: 80000,
      age: 35,
    },
    buyer2: {
      name: "Buyer 2",
      citizenship: "SPR",
      monthlyIncome: 4500,
      cpfOaAvailable: 50000,
      age: 33,
    },
    numChildren: 2,
    childrenCitizenship: "ALL_SC",
    firstTimerStatus: "BOTH_FIRST",
    proximity: "NONE",
    sprWillBecomeSc: false,
  },
  flat: {
    resalePrice: 600000,
    valuation: 580000,
    flatType: "4-room",
    remainingLeaseYears: 70,
    loanType: "HDB",
    interestRatePct: 2.6,
    tenureYears: 25,
    propertyCount: 1,
  },
  split: {
    mode: "INCOME",
    customBuyer1Pct: 50,
  },
  policy: DEFAULT_POLICY,
  timeline: SAMPLE_TIMELINE,
  includeStampDutyInCash: true,
};

/** Deep clone of the sample state for resets / initial seeding. */
export function freshSampleState(): AppState {
  return structuredClone(SAMPLE_STATE);
}
