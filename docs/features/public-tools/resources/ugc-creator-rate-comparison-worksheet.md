# UGC Creator Rate Comparison Worksheet

## Purpose

This free worksheet compares up to three UGC creator quotes entered by the
visitor. It makes totals, cost per deliverable, cost per expected usable clip,
revisions, raw-footage inclusion, and entered usage terms easier to review.

## How it works

- Total cost equals quoted price plus required add-ons.
- Normalized costs divide that total by the entered deliverable or usable-clip
  count.
- Medians use only valid values from the quotes entered in this browser.
- A zero-price quote slot is omitted rather than treated as a free quote.

The worksheet contains no external rate data or claimed industry average.

## Files

- Logic, types, defaults, limits, FAQs, and tests:
  `web/lib/clipstitchr/tools/ugcCreatorRateComparison/`.
- Atomic UI and page tests:
  `web/app/_components/tools/ugc-creator-rate-comparison-worksheet/`.
- Route:
  `web/app/(content)/tools/ugc-creator-rate-comparison-worksheet/page.tsx`.

## Free and paid boundary

The worksheet does not source or hire creators, negotiate terms, interpret
contracts, verify rights, provide legal advice, store footage, or produce ads.
ClipStitchr remains the paid workflow for using approved source material.

## Sources

- `docs/content/lead-magnets/portfolio.md`, portfolio item 38.
- `docs/features/public-tools/portfolio/public-tool-batch-16-50-design.md`.
- `docs/features/public-tools/portfolio/public-tool-quality-register.md`.
