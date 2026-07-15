# App Creative Asset Inventory Template

## What it does

The public inventory at `/tools/app-creative-asset-inventory-template` helps an
app team count six kinds of creative material:

1. Hooks and opening lines.
2. UGC clips.
3. Product demos.
4. Avatar or presenter clips.
5. Calls to action.
6. Finished ads.

Each kind has separate counts for ready, needs work, missing, and rights
unknown. The tool returns totals, ready coverage, prioritized captures and
fixes, and downloadable CSV and Markdown files.

## How it works

Ready coverage is `ready / all counted statuses × 100`. Rights-unknown assets
stay outside the ready count even when the file itself appears finished. A
deterministic severity rule ranks missing items first, then rights uncertainty,
then needs-work items. Dependency priority resolves ties so product-demo and
UGC source gaps surface before downstream finished-ad gaps.

The form starts with a clearly labeled example to make every status and output
visible. Visitors replace those counts with their actual inventory. All state
stays in the current browser session, and both exports are generated locally.

## Use cases

- Find the source-material gap blocking the next app-ad test.
- Keep usage uncertainty separate from visual quality.
- Hand a capture priority list to a founder, creator, or marketer.
- Move a session snapshot into a spreadsheet or planning document.

## Boundaries

This capability is not an asset library. It does not accept files, save rows,
search media, verify rights, transform footage, or create ads. Rights-unknown
is a workflow flag, not legal advice or permission verification. Paid
ClipStitchr remains the place for organizing reusable footage and producing
finished creative.

## Relevant files

```text
web/app/(content)/tools/app-creative-asset-inventory-template/page.tsx
web/app/_components/tools/creative-asset-inventory/
web/lib/clipstitchr/tools/creativeAssetInventory/
```

Pure tests cover coverage arithmetic, the empty-inventory state, severity
ordering, rights uncertainty, and both exports. The page test proves all six
asset types, four statuses, immediate priorities, lead source, paid CTA, and
canonical metadata.

## Source references

- Portfolio capability contract: `docs/features/public-tools/portfolio/public-tool-batch-16-50-design.md`
- Catalog record: `web/lib/clipstitchr/tools/catalog/publicToolCatalog.ts`
- Shared CSV escaping: `web/lib/clipstitchr/tools/csv/createCsvText.ts`
- Paid boundary and verification state: `docs/features/public-tools/portfolio/public-tool-quality-register.md`
