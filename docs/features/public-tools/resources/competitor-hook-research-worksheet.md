# Competitor Hook Research Worksheet

## What it does

The public `/tools/competitor-hook-research-worksheet` route accepts up to five
manual app-ad observations. It counts repeated structure tags and produces a
downloadable research summary that visibly separates observed words, visuals,
handoffs, and proof from audience and intent inferences.

## How it works

`synthesizeCompetitorHookResearch` ignores empty entries, caps the set at five,
counts the visitor's own pattern tags, and builds separate evidence and
inference lists. It adds research questions that encourage validation and an
original follow-up test rather than copying another advertiser's words.

## Use cases and boundary

- Record consistent notes while reviewing app ads.
- See which manually tagged structures recur in the entered sample.
- Keep facts separate from interpretations before planning an original test.
- Does not scrape, download, transcribe, monitor, attribute performance, or
  recommend copying competitor creative.

## Relevant files

- `web/lib/clipstitchr/tools/competitorHookResearch/`
- `web/app/_components/tools/competitor-hook-research/`
- `web/app/(content)/tools/competitor-hook-research-worksheet/page.tsx`

## Source references

- Capability contract: `docs/features/public-tools/portfolio/public-tool-batch-16-50-design.md`
- Catalog identity: `web/lib/clipstitchr/tools/catalog/publicToolCatalog.ts`
- Ongoing evidence: `docs/features/public-tools/portfolio/public-tool-quality-register.md`

## Verification

Pure tests verify the five-item cap, repeated-pattern counts, and evidence versus
inference output. The page test proves editable observations, result sections,
download, lead source, paid CTA, and canonical metadata render.
