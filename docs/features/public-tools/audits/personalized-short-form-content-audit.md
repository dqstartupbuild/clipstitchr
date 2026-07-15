# Personalized Short-Form Content Audit

## What it does

The public audit at `/tools/personalized-short-form-content-audit` turns ten
visible self-review answers into a transparent 100-point short-form content
system score. Two ten-point questions roll into each of five dimensions:

- Message clarity.
- Asset readiness.
- Repeatable production.
- Testing discipline.
- Learning loop.

Every answer is explicitly worth 0, 5, or 10 points. The result shows all five
20-point scores, lost-point priorities, source-asset gaps, and a complete
fourteen-day action plan. Visitors can download the full result as Markdown.

## How it works

`calculatePersonalizedShortFormAudit.ts` sums the selected values, calculates
lost points, and ranks dimensions from largest gap to smallest. The weakest
answer in each dimension supplies its practical focus. Asset readiness answers
also expose missing reusable openings or product-demo/proof footage.

The action plan remains dependency ordered even when a later dimension has the
largest score gap:

- Days 1–2 settle message clarity.
- Days 3–5 inventory and close asset gaps.
- Days 6–8 document production and handoffs.
- Days 9–11 define controlled testing.
- Days 12–14 establish the review and follow-up loop.

Each day includes the relevant lost-point action when that dimension is not at
full score. This makes the sequence personalized without hiding the scoring or
inventing AI analysis.

## Use cases

- Diagnose whether clarity, assets, workflow, testing, or learning is the
  current bottleneck.
- Turn a broad “we need more content” concern into two weeks of ordered work.
- Surface missing reusable openings or demo/proof footage.
- Download a plain-language scorecard for a team review.

## Boundaries

This is a browser-local self-audit. It does not connect to accounts, inspect
media, verify assets, store files, create ads, or predict performance. The
score is not an outside benchmark. The free result prepares work; paid
ClipStitchr remains the production and reusable-footage workflow.

## Relevant files

```text
web/app/(content)/tools/personalized-short-form-content-audit/page.tsx
web/app/_components/tools/personalized-short-form-audit/
web/lib/clipstitchr/tools/personalizedShortFormAudit/
```

Pure tests prove the 100-point ceiling, five equal dimensions, lost-point
ordering, asset gaps, fourteen-day dependency order, and complete download.
The page test covers immediate scoring, visible dimensions and plan endpoints,
lead source, paid CTA, and canonical metadata.

## Source references

- Portfolio capability contract: `docs/features/public-tools/portfolio/public-tool-batch-16-50-design.md`
- Catalog record: `web/lib/clipstitchr/tools/catalog/publicToolCatalog.ts`
- Paid boundary and verification state: `docs/features/public-tools/portfolio/public-tool-quality-register.md`
