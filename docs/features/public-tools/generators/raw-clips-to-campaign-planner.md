# Raw Clips to Campaign Planner

## Purpose

This browser-local flagship planner turns a named, text-only raw-asset
inventory into up to six campaign concept cards. It makes existing coverage,
reuse, and missing captures visible before more production begins.

## Planning rules

The planner creates distinct hook-and-body pairs, rotates available proof and
CTA pieces, and caps the result at six cards. Each compatibility score gives 30
points for a hook, 30 for a UGC or demo body, 15 for proof, 15 for a CTA, and up
to 10 for tags repeated across selected assets. The score does not predict ad
performance. Coverage counts the five asset roles. The reuse map counts how
often each named asset appears in the shown concepts.

## Production handoff

The copyable Markdown includes the bounded inventory, concepts, coverage,
missing captures, reuse counts, and the scoring disclaimer. Empty names are
ignored and analysis is capped at 24 text records.

## Files

- Types, role definitions, defaults, tag logic, planner, Markdown, FAQs, and
  tests: `web/lib/clipstitchr/tools/rawClipsCampaignPlanner/`.
- Atomic UI and page tests:
  `web/app/_components/tools/raw-clips-to-campaign-planner/`.
- Route: `web/app/(content)/tools/raw-clips-to-campaign-planner/page.tsx`.

## Privacy and boundary

The planner accepts text only and stores nothing. It does not accept media,
maintain an asset library, stitch, render, schedule, publish, or export an ad.
The visitor must copy the Markdown before leaving to retain the plan.

## Sources

- `docs/content/lead-magnets/portfolio.md`, portfolio item 49.
- `docs/features/public-tools/portfolio/public-tool-batch-16-50-design.md`.
- `docs/features/public-tools/portfolio/public-tool-quality-register.md`.
