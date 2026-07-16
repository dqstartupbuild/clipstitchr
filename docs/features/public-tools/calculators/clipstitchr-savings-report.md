# Interactive ClipStitchr Savings Report

## Purpose

This browser-local report compares a visitor's current monthly content
production workflow with a visitor-defined ClipStitchr scenario. It keeps time,
cost, output, source-footage use, and the selected public plan price visible.

## Formulas

- Labor hours equal finished creatives multiplied by editing hours, plus
  revision hours.
- Labor cost equals labor hours multiplied by the entered loaded hourly cost.
- Current total adds source footage, current labor, and current software.
- Modeled total adds the same source-footage cost, modeled labor, and the exact
  selected ClipStitchr monthly price.
- Cost per creative divides each total by that scenario's output.
- Footage utilization divides used source clips by entered usable clips.

All output and time changes come from visitor assumptions. The report labels
them as modeled differences rather than promises.

## Shared pricing source

`web/lib/clipstitchr/pricing/PricingPlan.ts` exposes `monthlyPriceUsd`, and
`web/lib/clipstitchr/pricing/pricingPlans.ts` supplies exact values for Starter,
Pro, and Agency. The pricing page keeps its display strings while the calculator
uses the matching numeric values.

## Files

- Logic, types, defaults, limits, FAQs, and tests:
  `web/lib/clipstitchr/tools/clipStitchrSavings/`.
- Atomic UI and page tests:
  `web/app/_components/tools/clipstitchr-savings-report/`.
- Route: `web/app/(content)/tools/clipstitchr-savings-report/page.tsx`.

## Free and paid boundary

The report does not guarantee savings or output, inspect a team workflow,
produce media, or model ad performance and revenue. It ends with a clear link
to paid ClipStitchr plans.

## Sources

- `docs/content/lead-magnets/portfolio.md`, portfolio item 50.
- `docs/features/public-tools/portfolio/public-tool-batch-16-50-design.md`.
- `docs/features/public-tools/portfolio/public-tool-quality-register.md`.
