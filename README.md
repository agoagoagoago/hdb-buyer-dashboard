# HDB Buyer Loan & Grant Dashboard

A clean, mobile-responsive planning dashboard for **Singapore HDB resale buyers** (e.g. an SC + SPR
couple with children) to estimate:

- Buyer eligibility & CPF housing grants (Family Grant, EHG, Proximity, Citizen Top-Up)
- Individual ("respective") and combined ("total") loan responsibility
- Loan-to-value limit, maximum loan, downpayment, CPF vs cash breakdown
- Estimated monthly instalment (and each buyer's share) + total interest
- Cash-over-valuation and cash needed upfront
- Buyer's Stamp Duty (BSD) and Additional Buyer's Stamp Duty (ABSD)
- A 12-step HDB resale timeline checklist

> ⚠️ **This is an estimation and planning tool — not official financial or legal advice.**
> HDB grants, HFE eligibility, loan amount, CPF usage, MSR/TDSR assessment, stamp duties, and resale
> approval are subject to official HDB, CPF Board, IRAS, and lender rules. Always verify with HDB, CPF,
> your bank, and a licensed property agent.

## Tech stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- Hand-built **shadcn/ui-style** components (no runtime UI dependency lock-in)
- **Vitest** unit tests for all financial calculations
- Client-side only — no backend, no database, no environment variables
- Inputs auto-persist to **localStorage**

## Features

| Section | What it does |
| --- | --- |
| Household Profile | Both buyers (citizenship, income, CPF OA, age), children, first-timer status, proximity to parents |
| Flat Details | Resale price, valuation, flat type, lease, loan type, interest rate, tenure, property count |
| Grant Estimator | Family/CPF Housing Grant, EHG, Proximity Grant, Citizen Top-Up + eligibility warnings |
| Loan Calculator | Editable LTV/rate/tenure; loan, downpayment, CPF/cash, instalment, total interest |
| Buyer Contribution | Per-buyer table with 50/50, income-ratio, or custom split modes |
| Stamp Duty | BSD (progressive) + ABSD by citizenship/property count, with remission note |
| Summary Cards | Grants, total loan, monthly instalment, COV, cash upfront, each buyer's monthly share |
| Timeline | 12 resale milestones with checkbox, date, and status |
| Assumptions | **Every policy figure is editable** (LTV, grant amounts, EHG bands, BSD/ABSD rates) |

## Local setup

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run lint     # ESLint
npm test         # Vitest (financial calculation tests)
npm run build    # Production build (Vercel parity)
```

## Deploy to Vercel

The app is a standard Next.js project and is Vercel-ready (no env vars required).

1. Push to GitHub (this repo is published at **github.com/agoago/hdb-buyer-dashboard**).
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** the `agoago/hdb-buyer-dashboard` repo.
3. Framework preset: **Next.js** (auto-detected). Build command `next build`, output handled automatically.
4. Environment variables: **none required**.
5. Click **Deploy**.

Or via CLI:

```bash
npm i -g vercel
vercel          # preview deploy
vercel --prod   # production deploy
```

## Assumptions

All figures live in editable config (`src/lib/constants.ts` → `DEFAULT_POLICY`) and can be changed in the
**Assumptions** tab at runtime — no code edits needed.

- **LTV**: HDB & bank loans default to **75%**; bank loans assume a **5% minimum cash** downpayment.
- **Cash-over-valuation** (price − valuation) must always be paid in cash.
- **Family Grant** (first-timers): SC+SC = $80k (2–4 room) / $50k (5-room+); SC+SPR = $70k / $40k.
- **Citizen Top-Up**: $10k for SC+SPR families with an SC child (or if the SPR spouse becomes an SC).
- **Proximity Grant**: $30k living with parents, $20k within 4km, else $0.
- **EHG**: editable income-band table (default ceiling $9,000/mth, up to $120k). Estimate only.
- **Stamp duty**: progressive BSD; ABSD assessed at the higher of the couple's profile rates (SC 0% /
  SPR 5% / Foreigner 60% on a first property), before any married-couple remission.
- The buyer breakdown applies the chosen ownership split to loan, downpayment, CPF, and cash; CPF OA is
  used for the CPF-eligible portion first, with the remainder funded in cash.

## Disclaimer

This dashboard provides estimates only. HDB grants, HFE eligibility, loan amount, CPF usage, MSR/TDSR
assessment, stamp duties, and resale approval are subject to official HDB, CPF Board, IRAS, and lender
rules. Buyers should verify with HDB, CPF, their bank, and a licensed property agent.

## Official-rule areas to verify before real use

These change with policy — confirm the live figures and update them in the Assumptions tab:

- Grant quantums, income ceilings, and EHG bands (HDB/CPF)
- LTV limits and MSR/TDSR rules (HDB/MAS/lenders)
- CPF usage rules and the impact of remaining lease on CPF/loan
- BSD/ABSD rates and married-couple ABSD remission (IRAS)
- HFE letter eligibility and resale levy for second-timers

## Future improvements

- MSR/TDSR affordability checks against income and existing debt
- Resale levy modelling for second-timers
- HFE-driven eligibility gating and income-ceiling checks per grant
- Save/compare multiple scenarios; export to PDF
- CPF Ordinary Account projection over the loan tenure
- i18n and a dark theme
