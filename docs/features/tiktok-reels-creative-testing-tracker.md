# TikTok and Reels Creative Testing Tracker

## What it does

The public tracker at `/tools/tiktok-reels-creative-testing-tracker` gives app
marketers an editable, browser-local table for recording short-form creative
experiments. Each row records channel, hook, opening visual, call to action,
spend, impressions, clicks, installs, and conversions.

The page calculates four row-level metrics only when their denominators exist:

- CTR = clicks / impressions × 100.
- Install rate = installs / clicks × 100.
- CPI = spend / installs.
- CPA = spend / conversions.

When a denominator is zero, the result names the missing input instead of
displaying zero, `Infinity`, or `NaN`. Visitors can add or remove up to twelve
session rows and download the current table as valid CSV or readable Markdown.

## How it works

`calculateCreativeTestingMetrics.ts` is the deterministic calculation boundary.
The two export functions reuse those results so downloaded values match the
screen. `CreativeTestingTrackerWorkspace.tsx` owns only session state; no
browser storage, server request, analytics payload, or ad-account connection
contains the entered creative or campaign data.

The starting rows are deliberately empty. They show the denominator-specific
states immediately and do not pretend to be visitor performance data.

## Use cases

- Keep the creative setup beside manually copied outcome numbers.
- Preserve a small testing round as a spreadsheet-ready CSV.
- Identify why a row cannot support a requested metric yet.
- Carry a test note into the campaign retrospective resource.

## Boundaries

This tracker does not connect to TikTok, Meta, or an attribution provider. It
does not know attribution windows, delayed reporting, bids, audiences, or
delivery settings. It does not persist experiments or create creative. The
mailing-list form sends only the visitor's submitted name and email through the
existing protected lead route.

## Relevant files

```text
web/app/(content)/tools/tiktok-reels-creative-testing-tracker/page.tsx
web/app/_components/tools/creative-testing-tracker/
web/lib/clipstitchr/tools/creativeTestingTracker/
```

The pure calculation and export tests cover complete formulas, every missing
denominator, CSV escaping, and Markdown output. The page test covers the route
promise, immediate editable result, exports, lead source, paid CTA, and
canonical metadata.

## Source references

- Portfolio capability contract: `docs/features/public-tool-batch-16-50-design.md`
- Catalog record: `web/lib/clipstitchr/tools/catalog/publicToolCatalog.ts`
- Shared CSV escaping: `web/lib/clipstitchr/tools/csv/createCsvText.ts`
- Paid boundary and verification state: `docs/features/public-tool-quality-register.md`
