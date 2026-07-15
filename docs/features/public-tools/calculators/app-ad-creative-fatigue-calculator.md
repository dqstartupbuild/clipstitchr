# App-Ad Creative Fatigue Calculator

## Purpose

This public calculator gives app marketers a transparent exposure model using
their own audience size, daily impressions, active creative count, planning
window, and frequency ceiling. It does not claim to detect fatigue.

## How it works

- Daily modeled frequency is daily impressions divided by audience size.
- Window frequency multiplies daily frequency by the entered number of days.
- Days to ceiling divides the visitor's ceiling by daily frequency.
- Impressions are split evenly across active creatives as a visible planning
  assumption.

The page returns results immediately in the browser. It sends no scenario data
to ClipStitchr. The only backend action is the separately submitted mailing-list
form, which uses the existing protected lead route.

## Files

- Pure types, defaults, formulas, limits, FAQs, and tests live in
  `web/lib/clipstitchr/tools/appAdCreativeFatigue/`.
- Atomic UI and page tests live in
  `web/app/_components/tools/app-ad-creative-fatigue-calculator/`.
- The public route is
  `web/app/(content)/tools/app-ad-creative-fatigue-calculator/page.tsx`.

## Free and paid boundary

The free experience models entered delivery assumptions. It does not inspect
ad accounts, predict performance, recommend a refresh schedule, produce new
creative, or execute a campaign. Finished creative production remains part of
the paid ClipStitchr workflow.

## Sources

- `docs/content/lead-magnets/portfolio.md`, portfolio item 33.
- `docs/features/public-tools/portfolio/public-tool-batch-16-50-design.md`.
- `docs/features/public-tools/portfolio/public-tool-quality-register.md` records release evidence.
