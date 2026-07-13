# 30-Day App Content Plan

## What it does

The public `/tools/30-day-app-content-plan` route turns an app name, start
date, goal, launch stage, weekly cadence, camera comfort, and available assets
into exactly thirty dated actions. Publishing days use the visitor's available
source material. Every other day contains production, repurposing, or review
work instead of an empty calendar cell.

The complete plan appears before the optional mailing-list form and downloads
as Markdown. It stays in the browser and is not saved to an account.

## How it works

`createThirtyDayContentPlan` maps the selected cadence to publishing weekdays,
rotates goal-specific angles and available assets, and fills the remaining
dates with useful supporting work. `formatThirtyDayContentPlanMarkdown`
creates the downloadable file. The interactive workspace recalculates the plan
as inputs change.

## Use cases and boundary

- Plan a launch, awareness, activation, or retention month.
- Balance publishing with capture, reuse, and learning work.
- Download a practical handoff for a founder or marketing teammate.
- Does not write scripts, schedule posts, publish content, save plans, or make
  media.

## Relevant files

- `web/lib/clipstitchr/tools/thirtyDayContentPlan/`
- `web/app/_components/tools/thirty-day-content-plan/`
- `web/app/(content)/tools/30-day-app-content-plan/page.tsx`

## Source references

- Capability contract: `docs/features/public-tool-batch-16-50-design.md`
- Catalog identity: `web/lib/clipstitchr/tools/catalog/publicToolCatalog.ts`
- Ongoing evidence: `docs/features/public-tool-quality-register.md`

## Verification

The pure test proves all supported cadences return thirty unique dates and all
four action kinds. The page test proves the complete result, download, lead
source, paid CTA, and canonical metadata are present.
