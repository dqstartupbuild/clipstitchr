# App Ad Creative Test Plan Generator

## Overview

The public tool at `/tools/app-ad-test-plan-generator` converts available app-ad
assets and weekly production capacity into a copyable three-wave testing plan.
It helps app founders and marketers separate the full combination opportunity
from the smaller sequence they can produce and interpret.

The plan is visible before mailing-list capture. It plans creative production,
not ad-platform bidding, statistical significance, or guaranteed performance.

## Inputs

The browser accepts:

- App name
- Testing goal
- Audience
- Available Hook/UGC openings
- Available product demos
- Available hook directions
- Available calls to action
- Weekly production capacity from 1 through 20
- Optional weekly testing budget in USD

Asset counts reuse the Ad Variant Calculator's bounded non-negative whole-number
normalization. The weekly capacity stops at 20 to remain aligned with a focused
Stitchr batch.

## Combination and Wave Rules

`createAppAdTestPlan` passes the four asset counts to the existing
`calculateAdVariantPlan` function. This supplies the same total-combination and
practical-first-batch concepts without duplicating the existing math.

The sequential plan is intentionally different from the Cartesian total:

1. Wave 1 changes UGC openings while demo, hook, and CTA stay fixed.
2. Wave 2 keeps the strongest footage pairing and changes hook direction.
3. Wave 3 keeps the strongest opening and hook, rotates demos, then returns to
   the strongest demo and rotates CTAs.

Wave 1 requires at least two UGC openings plus one demo, hook, and CTA. Wave 2
also requires two hooks. Wave 3 requires at least two demos or two CTAs. Missing
inputs produce explicit preparation items and a `needs-assets` wave instead of
impossible variants.

`createAppAdTestPlanSchedule` divides each ready wave into sequential weekly
groups that never exceed capacity. If a budget was supplied, each week's amount
is divided evenly by that week's live variant count. The page labels this as
arithmetic, not a spend recommendation.

`formatAppAdTestPlanText` creates the copyable plan with goal, hypothesis,
opportunity, waves, weekly order, preparation work, and measurement guardrail.

## User Experience and Conversion

The page includes canonical metadata, matching FAQ and WebApplication structured
data, immediate metrics, readiness warnings, three wave cards, weekly schedule,
a full-plan copy button, shared mailing-list capture, guidance, FAQ, and related
tools.

The paid CTA points to `/pricing` after the user sees the number of variants the
ready waves require. It explains that ClipStitchr can produce focused batches
from saved Hook/UGC clips and product demos. No free account or trial is offered.

## Privacy, Cost, and Abuse Surface

All calculations and text formatting are deterministic and browser-local. The
tool sends no app name, audience, goal, asset counts, budget, or result to an API
or analytics helper. It adds no provider/storage cost or new rate limit. The
existing shared mailing-list operation remains separately protected.

## File Tree

```text
web/app/(content)/tools/app-ad-test-plan-generator/page.tsx
web/app/_components/tools/app-ad-test-plan-generator/
  AppAdTestPlanFaq.tsx
  AppAdTestPlanForm.tsx
  AppAdTestPlanGenerator.tsx
  AppAdTestPlanGuide.tsx
  AppAdTestPlanHero.tsx
  AppAdTestPlanMetricCard.tsx
  AppAdTestPlanNumberField.tsx
  AppAdTestPlanPage.tsx
  AppAdTestPlanPage.test.tsx
  AppAdTestPlanPricingCta.tsx
  AppAdTestPlanResults.tsx
  AppAdTestPlanTextField.tsx
  AppAdTestPlanWaveCard.tsx
  AppAdTestPlanWeekCard.tsx
web/lib/clipstitchr/tools/appAdTestPlan/
  AppAdTestPlanInput.ts
  AppAdTestPlanResult.ts
  AppAdTestPlanWave.ts
  AppAdTestPlanWaveStatus.ts
  AppAdTestPlanWeek.ts
  appAdTestPlanDescription.ts
  appAdTestPlanFaqs.ts
  appAdTestPlanFieldLimits.ts
  createAppAdTestPlan.ts
  createAppAdTestPlan.test.ts
  createAppAdTestPlanPreparationItems.ts
  createAppAdTestPlanSchedule.ts
  createAppAdTestPlanWaves.ts
  defaultAppAdTestPlanInput.ts
  formatAppAdTestPlanText.ts
  formatAppAdTestPlanUsd.ts
  normalizeAppAdTestPlanInput.ts
```

## Source References

- `web/lib/clipstitchr/tools/adVariantCalculator/calculateAdVariantPlan.ts`
  supplies the reused opportunity and practical-batch calculation.
- `web/lib/clipstitchr/tools/adVariantCalculator/createAdVariantTestPhases.ts`
  establishes the existing UGC-first, hooks-second, demo/CTA-later sequence.
- `project-scope.md` defines the 20-UGC/one-demo Stitchr batch shape.
- `docs/features/public-tool-batch-3-10-design.md` defines the approved
  three-wave public contract.

## Verification

Focused tests cover the reused combination total, practical first batch, all
wave counts, weekly overflow, capacity enforcement, budget division, missing
asset preparation, unsafe numeric normalization, copy formatting, metadata,
structured data, lead source, related links, paid CTA, and paid-only language.

The candid release status and next refinement are recorded in
`docs/features/public-tool-quality-register.md`.
