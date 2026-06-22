@AGENTS.md

# HDB Buyer Loan & Grant Dashboard

Planning/estimation tool for **Singapore HDB resale buyers** (built around an SC + SPR couple with
children). Estimates buyer eligibility, CPF housing grants, respective & total loan responsibility,
cash required, stamp duty (BSD/ABSD), and the resale timeline. **Estimates only — not financial or
legal advice.**

- Repo: `github.com/agoagoagoago/hdb-buyer-dashboard` (pushed under the `gh`-authenticated account
  `agoagoagoago`; the user's stated handle `agoago` was not the authenticated account).
- Deploys on **Vercel** (no env vars, no backend).

## Commands

```bash
npm run dev      # local dev at http://localhost:3000
npm test         # Vitest (financial calc tests) — run after touching anything in src/lib
npm run lint     # ESLint (must be clean)
npm run build    # production build = Vercel parity (must pass before pushing)
```

Always run `npm test && npm run lint && npm run build` before committing.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript** (strict).
- **Tailwind CSS v4** (config-less; theme tokens in `src/app/globals.css`).
- **Hand-built shadcn-style UI** in `src/components/ui` — NOT the shadcn CLI, and **no Radix**.
  Dropdowns are styled native `<select>`; tabs/accordion are state-driven. Do not add Radix or run
  `shadcn init` — keep the zero-UI-dependency approach for build reliability.
- **Vitest** + jsdom for unit tests (calculations only; no component tests yet).
- Client-side only. State persists to **localStorage** via `useLocalStorage`.

## Architecture

Single dashboard page (`src/app/page.tsx`) holds the entire `AppState` in one `useLocalStorage` hook
and derives everything via `useMemo` from **pure functions in `src/lib`**. A second route
(`src/app/absd/page.tsx`) is a self-contained ABSD calculator with its own local state.

**Golden rule: all calculation/business logic lives in `src/lib` as pure functions. Components never
compute money — they format and display.** Add a unit test for every new lib function.

### Key files

- `src/types/hdb.ts` — all domain types + editable config types (`PolicyConfig`, `GrantConfig`,
  `StampDutyConfig`, `AppState`).
- `src/lib/constants.ts` — `SAMPLE_STATE` (sample SC+SPR family defaults), `DEFAULT_POLICY` (all
  editable policy figures), `SAMPLE_TIMELINE`, `freshSampleState()`. **All policy dollar amounts /
  rates live here** so they can be changed without touching logic.
- `src/lib/hdbCalculations.ts` — loan math: `calculateMonthlyPayment`, `calculateTotalInterest`,
  `calculateCashOverValuation`, `calculateIncomeRatioSplit`, `calculateLoanShare`,
  `calculateCPFUsage`, `resolveSplitPercents`, `presentValueOfAnnuity`, `computeBorrowingCapacity`
  (MSR/TDSR income cap), `computeLoanSummary` (maxLoan = min(LTV cap, income cap)),
  `computeBuyerBreakdowns`.
- `src/lib/grantRules.ts` — `estimateFamilyGrant`, `estimateCitizenTopUp`, `estimateProximityGrant`,
  `estimateEHG`, `estimateTotalGrants`, `buildGrantWarnings`.
- `src/lib/stampDuty.ts` — `calculateBsd`, `absdRateFor`, `estimateStampDuty` (dashboard card) and
  `assessAbsd` (rich ABSD calculator with remission/refund detection).
- `src/lib/formatters.ts` — `formatCurrency`, `formatCurrencyPrecise`, `formatPercent` (SGD, `en-SG`).
- `src/lib/useLocalStorage.ts` — SSR-safe persisted state hook.
- `src/components/ui/*` — primitives (card, button, input, select, checkbox, label, field,
  number-input, tabs, accordion, table, badge, alert) + `cn` in `src/lib/utils.ts`.
- `src/components/dashboard/*` — feature components (HouseholdProfileForm, FlatDetailsForm,
  GrantEstimator, LoanCalculator, BuyerContributionTable, LoanSummaryCards, StampDutyCard,
  TimelineChecklist, DisclaimerPanel, AssumptionsPanel, AbsdCalculator).
- `src/tests/*.test.ts` — Vitest tests for the three calc libs (42 tests).

### Data flow

`page.tsx` state → `useMemo(computeLoanSummary / estimateTotalGrants / computeBuyerBreakdowns /
estimateStampDuty)` → passed as props to dashboard components → formatted for display. The
**Assumptions** tab edits `policy` live, so every derived number recomputes.

## Domain rules currently modelled (defaults in `DEFAULT_POLICY`)

- **LTV**: HDB & bank 75%; bank assumes 5% minimum cash downpayment. Cash-over-valuation (price −
  valuation) is always cash.
- **Income cap (MSR/TDSR)**: HDB loans MSR 30% only; bank loans lower of MSR 30% / TDSR 55% (− other
  debts). Loan sized at a stress-test rate (HDB 3%, bank 4%). Effective max loan = min(LTV, income).
  Surfaced in `BorrowingCapacity.tsx` (Buyer 1 / Buyer 2 / combined) in the Loan tab.
- **Family Grant** (first-timers): SC+SC $80k (2–4 room)/$50k (5-room+); SC+SPR $70k/$40k.
- **Citizen Top-Up** $10k: SC+SPR family with an SC child, or if the SPR spouse intends to become SC.
- **Proximity** $30k (living with parents) / $20k (within 4km) / $0.
- **EHG**: editable income-band table, ceiling $9,000/mth, up to $120k (sample family earns $10.5k →
  $0, correctly over ceiling).
- **BSD**: progressive brackets on higher of price/valuation.
- **ABSD**: assessed at the higher of the couple's profile rates (SC 0% / SPR 5% / Foreigner 60% on a
  first property). `assessAbsd` detects: **full remission** (married, ≥1 SC, first property jointly →
  $0) and **refund** (married SC couple buying 2nd, selling 1st in the qualifying period → paid
  upfront, refundable).

These change with policy — surfaced as editable config and called out in `README.md` under
"Official-rule areas to verify".

## Conventions

- Money is computed in `src/lib`, displayed via `formatters.ts`. Never inline `Intl.NumberFormat`.
- New policy numbers go in `DEFAULT_POLICY` (and `PolicyConfig`/`GrantConfig`/`StampDutyConfig`), not
  hardcoded in components — keep everything editable.
- React 19 lint forbids `setState` in effects (`react-hooks/set-state-in-effect`). Use render-time
  state adjustment (see `number-input.tsx`) or justify with an eslint-disable (see `useLocalStorage.ts`).
- `Button` has no `asChild`; for link-styled buttons use `buttonVariants({ variant })` on `<Link>`
  (see the ABSD link in `page.tsx`).
- Keep disclaimers prominent — this is an estimator, never present output as approval/advice.

## Not yet built (future work)

Second-timer resale levy, HFE-driven eligibility gating, age/lease-based tenure limits, scenario
save/compare + PDF export, CPF OA projection over tenure, dark theme/i18n, component-level tests.
