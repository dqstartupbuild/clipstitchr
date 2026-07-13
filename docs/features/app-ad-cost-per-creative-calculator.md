# App Ad Cost per Creative Calculator

## Overview

The public tool at `/tools/app-ad-cost-per-creative-calculator` shows what one
publishable app-ad creative costs today and how an entered reuse scenario would
change the blended unit cost. It is intentionally different from the App UGC
Production Cost Calculator: that tool explains one detailed production cycle,
while this one compares current unit economics with finishing more creatives
from source footage that has already been paid for.

The visitor receives the complete calculation before the mailing-list form.
ClipStitchr remains a paid product, and the tool neither creates nor stores the
additional creatives in the scenario.

## Inputs and Bounds

The calculator accepts bounded non-negative values for:

- Source-footage cost, editing/finishing cost, internal cost, and other
  allocated cost: USD from 0 through 1,000,000 each.
- Current publishable creatives: a whole number from 0 through 10,000.
- Additional creatives planned from the same source assets: a whole number
  from 0 through 10,000.
- Extra finishing cost for those additional creatives: USD from 0 through
  1,000,000.

A publishable creative means one genuinely usable ad version. Duplicate file
formats, downloads, and aspect-ratio copies should not be counted as different
creative ideas. The prefilled values are an example, not a market benchmark.

Amounts normalize to cents. Counts floor to whole numbers. Negative,
non-finite, and over-limit values cannot enter the result.

## Calculation Rules

`calculateAppAdCostPerCreative` uses these transparent formulas:

```text
current total = source + editing + internal + other
current unit = current total / current creative count
applied added cost = added count > 0 ? entered added cost : 0
projected count = current count + added count
projected total = current total + applied added cost
incremental unit = applied added cost / added count
blended unit = projected total / projected count
dollar change = current unit - blended unit
percentage change = dollar change / current unit * 100
reference at current average = current unit * projected count
difference from current average = reference - projected total
```

Every division checks its denominator first. Missing denominators return
`null`, never Infinity or NaN. A zero additional-creative count disables the
reuse scenario and prevents an entered finishing cost from silently changing
the total.

Positive comparison values mean the entered scenario is lower than repeating
the visitor's current average. Negative values are shown as an increase. The
result never calls the difference guaranteed savings.

## User Experience and Conversion

The page shows the current production total and cost per publishable creative,
then an optional scenario containing:

- Added cost per additional creative.
- Projected creative count and total cost.
- Projected blended cost per creative.
- Dollar and percentage change.
- Difference from producing every projected version at the current average.

When no additional creatives are entered, the page asks the visitor to add a
planned count instead of showing meaningless comparison cards. When the
current count is missing, the projected unit cost can still be shown but the
current-average comparison remains unavailable.

The paid CTA explains that ClipStitchr can keep Hook/UGC clips and demos
reusable and turn source material into finished ads. It does not claim that
ClipStitchr will achieve the entered cost. The shared mailing-list form records
the fixed `app-ad-cost-per-creative-calculator` source and clearly says that
joining does not create an account.

## Privacy, Cost, and Paid Boundary

All inputs and calculations remain in browser memory. Production costs,
creative counts, and results are not sent to an API, stored, or added to
analytics. The calculator adds no provider, storage, or backend cost and no new
rate-limit surface beyond the already protected optional lead form.

The free tool calculates and compares. It does not:

- Store source footage or build an asset library.
- Produce, edit, stitch, or export an ad.
- Persist scenarios or production history.
- Predict ad performance.
- Promise a specific cost reduction.

Those exclusions preserve ClipStitchr's paid production job.

## SEO Identity

The central catalog owns the final metadata keywords. The focused search
identity is app-ad cost per creative, supported by cost-per-creative
calculator, mobile-app ad production cost, creative unit cost, and reusable
app-ad footage language. The route reads its keywords from the central catalog
instead of duplicating them in the feature implementation.

## File Tree

```text
web/app/(content)/tools/app-ad-cost-per-creative-calculator/page.tsx
web/app/_components/tools/
  ToolMetricCard.tsx
  ToolNumberField.tsx
  app-ad-cost-per-creative-calculator/
    AppAdCostPerCreativeCalculator.tsx
    AppAdCostPerCreativeFaq.tsx
    AppAdCostPerCreativeForm.tsx
    AppAdCostPerCreativeGuide.tsx
    AppAdCostPerCreativeHero.tsx
    AppAdCostPerCreativePage.tsx
    AppAdCostPerCreativePage.test.tsx
    AppAdCostPerCreativePricingCta.tsx
    AppAdCostPerCreativeResults.tsx
web/lib/clipstitchr/tools/
  appAdCostPerCreative/
    AppAdCostPerCreativeInput.ts
    AppAdCostPerCreativeResult.ts
    appAdCostPerCreativeDescription.ts
    appAdCostPerCreativeFaqs.ts
    appAdCostPerCreativeInputLimits.ts
    calculateAppAdCostPerCreative.ts
    calculateAppAdCostPerCreative.test.ts
    defaultAppAdCostPerCreativeInput.ts
    normalizeAppAdCostPerCreativeInput.ts
  numbers/
    formatUsd.ts
    getSafeWholeTarget.ts
    normalizeBoundedCount.ts
    normalizeBoundedDecimal.ts
```

## Quality Record

The durable portfolio rating lives in
[`docs/features/public-tool-quality-register.md`](./public-tool-quality-register.md).
At launch this tool is expected to be **Green**, **Useful**, **Protected**, and
**Automated**: the arithmetic and page are fully testable, the comparison is
valuable but depends entirely on visitor-entered costs, and the free result
does not perform ClipStitchr's paid production work.

The known limitation is that founders may interpret “publishable creative” or
the current-average comparison differently. The next refinement is to validate
those labels with real visitors before adding more inputs, AI, or external
benchmarks.

## Source References

- `docs/features/public-tool-batch-11-15-design.md` defines the approved
  formulas, bounds, result, and boundary.
- `docs/features/app-ugc-cost-calculator.md` documents the separate detailed
  production-cycle calculator.
- `docs/features/public-app-marketing-tools.md` documents the shared tool page,
  lead capture, discovery, SEO, and analytics architecture.
- `docs/product/positioning.md` defines the reusable-source-material and paid
  Stitchr production story.

## Verification

Focused tests cover exact default arithmetic, the inactive scenario, missing
current and projected denominators, an honestly higher-cost scenario, zero
baseline percentage handling, unsafe input normalization, canonical metadata,
structured data, exact lead source, related links, paid CTA, and the absence of
free-trial or guaranteed-savings promises.
