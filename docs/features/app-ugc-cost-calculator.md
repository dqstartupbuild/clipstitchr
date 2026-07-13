# App UGC Production Cost Calculator

## Overview

The public tool at `/tools/app-ugc-cost-calculator` estimates the cost of one app
UGC production cycle from visitor-supplied USD values. It makes creator,
editing, revision, internal coordination, per-item, unused-footage, monthly, and
annual arithmetic visible without supplying market-rate benchmarks.

The calculator is an acquisition and planning tool. It does not quote services,
promise savings, or offer a free ClipStitchr plan.

## Inputs and Bounds

The browser accepts bounded non-negative values for:

- Creator count and fee per creator
- Raw clips per creator
- Editing hours and hourly rate
- Paid revision count and cost per revision
- Internal coordination hours and hourly cost
- Estimated unused-footage percentage from 0 through 100
- Finished variant count
- Optional batches per month

Whole-number inputs are floored and bounded. Hours, rates, percentages, and
monthly cadence accept bounded decimal values. Unsafe, negative, NaN, and
infinite values normalize safely without entering the result.

## Calculation Rules

`calculateAppUgcCost` uses these transparent formulas:

- Creator cost = creator count × fee per creator
- Raw clips = creator count × raw clips per creator
- Editing cost = editing hours × editing hourly rate
- Revision cost = revision count × cost per revision
- Internal cost = internal hours × internal hourly cost
- Batch subtotal = creator + editing + revision + internal cost
- Cost per raw clip = subtotal ÷ raw clips when raw clips are greater than zero
- Cost per finished variant = subtotal ÷ finished variants when finished
  variants are greater than zero
- Unused-footage cost = creator cost × unused-footage percentage
- Monthly scenario = subtotal × batches per month when cadence is greater than
  zero
- Annual scenario = monthly scenario × 12

Unused-footage cost is a subset of creator spend and is never added again to the
subtotal. Zero denominators return `null`; the interface shows a plain-language
missing-input message instead of Infinity or NaN. Currency is formatted as USD
only at display time so intermediate arithmetic is not repeatedly rounded.

## User Experience and Conversion

The page shows immediate totals while the visitor changes inputs. Result cards
separate the subtotal, per-clip cost, per-finished-variant cost, four cost lines,
unused-footage context, and optional cadence scenarios.

The strongest conversion moment follows the unused-footage result. The pricing
CTA explains that a paid ClipStitchr account can keep Hook/UGC clips and product
demos reusable. It does not estimate ClipStitchr savings or compare the result
to a fabricated benchmark.

The shared mailing-list form records the fixed `app-ugc-cost-calculator` source.
Visible FAQs match the page's structured data, and related links connect the
calculator to the UGC brief builder and Ad Variant Calculator.

## Privacy, Cost, and Exclusions

All numbers stay in React state and all calculations happen in the browser. No
business cost, rate, output, or cadence value is sent to analytics, Convex, R2,
or a provider. The tool adds no new backend operation or rate limit.

The result explicitly excludes ad spend, usage/licensing fees, reshoots, taxes,
software, and any cost the visitor did not enter. It is a production subtotal,
not financial advice or a full campaign budget.

## File Tree

```text
web/app/(content)/tools/app-ugc-cost-calculator/page.tsx
web/app/_components/tools/app-ugc-cost-calculator/
  AppUgcCostBreakdown.tsx
  AppUgcCostCalculator.tsx
  AppUgcCostCalculatorFaq.tsx
  AppUgcCostCalculatorForm.tsx
  AppUgcCostCalculatorGuide.tsx
  AppUgcCostCalculatorHero.tsx
  AppUgcCostCalculatorPage.tsx
  AppUgcCostCalculatorPage.test.tsx
  AppUgcCostCalculatorResults.tsx
  AppUgcCostMetricCard.tsx
  AppUgcCostNumberField.tsx
  AppUgcCostPricingCta.tsx
web/lib/clipstitchr/tools/appUgcCostCalculator/
  AppUgcCostInput.ts
  AppUgcCostResult.ts
  appUgcCostDescription.ts
  appUgcCostFaqs.ts
  appUgcCostInputLimits.ts
  calculateAppUgcCost.ts
  calculateAppUgcCost.test.ts
  defaultAppUgcCostInput.ts
  formatAppUgcCostUsd.ts
  normalizeAppUgcCostAmount.ts
  normalizeAppUgcCostCount.ts
  normalizeAppUgcCostInput.ts
```

## Source References

- `docs/features/public-tool-batch-3-10-design.md` defines the approved input and
  formula contract and unused-footage conversion bridge.
- `project-scope.md` defines ClipStitchr's reusable Hook/UGC and demo library
  model.

## Verification

Focused tests cover creator/editing/revision/internal totals, raw and finished
denominators, unused-footage non-duplication, monthly and annual scenarios,
zero inputs, unsafe inputs, percentage caps, canonical metadata, JSON-LD, lead
source, related links, exclusions, paid CTA, and the absence of free-plan or
guaranteed-savings language.

The candid release status and next refinement are recorded in
`docs/features/public-tool-quality-register.md`.
