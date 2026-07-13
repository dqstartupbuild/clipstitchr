# App Marketing Content Calendar

## What it does

The public `/tools/app-marketing-content-calendar` route turns a month, weekly
cadence, channels, content pillars, owners, and campaign date into dated
publishing rows. Each row includes a channel, pillar, CTA role, owner, source
asset, and status. Visitors can edit source assets and statuses and download
the current table as CSV.

## How it works

`generateAppMarketingCalendar` selects consistent weekdays for two, three, or
five posts per week, rotates the visitor's channels, pillars, owners, and
available assets, and keeps up to five named campaign dates even when they fall
outside the normal cadence.
`createAppMarketingCalendarCsv` uses the shared CSV escaper so edited commas and
quotes remain valid.

## Use cases and boundary

- Create a monthly social-content planning table.
- Give a campaign date a visible CTA role.
- Assign source material and update production status before CSV handoff.
- Does not publish, remind, sync social accounts, persist collaboration, or
  make media.

## Relevant files

- `web/lib/clipstitchr/tools/appMarketingCalendar/`
- `web/app/_components/tools/app-marketing-content-calendar/`
- `web/app/(content)/tools/app-marketing-content-calendar/page.tsx`

## Source references

- Capability contract: `docs/features/public-tool-batch-16-50-design.md`
- CSV engine: `web/lib/clipstitchr/tools/csv/createCsvText.ts`
- Ongoing evidence: `docs/features/public-tool-quality-register.md`

## Verification

Pure tests verify bounded publishing rows, campaign inclusion, unique IDs, and
correct CSV escaping. The page test proves editable fields, CSV download, lead
source, paid CTA, and canonical metadata render.
