# App-Ad Creative Testing Budget Planner

## Purpose

This browser-local planner divides a visitor's own creative-testing budget
across production, active media, and an unassigned reserve. It keeps backlog
cells visible and compares active cells with the visitor's own evidence floor.

## Formulas

- Production budget is total budget multiplied by production percentage.
- Reserve is capped at the percentage remaining after production.
- Media receives the remaining amount.
- Even media per active cell is media divided by active cell count.
- Funded cells use the visitor's entered minimum-evidence spend.

No percentage, floor, or cell count is presented as a recommendation.

## Files

- Logic, types, defaults, limits, FAQs, and tests:
  `web/lib/clipstitchr/tools/appAdTestingBudget/`.
- Atomic UI and page tests:
  `web/app/_components/tools/app-ad-testing-budget-planner/`.
- Route: `web/app/(content)/tools/app-ad-testing-budget-planner/page.tsx`.

## Free and paid boundary

The free tool allocates visitor-entered numbers. It does not advise spend,
place bids, launch campaigns, predict performance, or produce the creatives
needed by the plan. ClipStitchr's paid product remains the production step.

## Sources

- `docs/content/lead-magnet-portfolio.md`, portfolio item 37.
- `docs/features/public-tool-batch-16-50-design.md`.
- `docs/features/public-tool-quality-register.md`.
