# Short-Form Content System Notion-Ready Kit

## What It Does

`/tools/short-form-content-system-notion-kit` provides five real CSV downloads:
Idea Bank, Shoot Planner, Asset Inventory, Publishing Calendar, and Results
Tracker. Every file has useful columns, two example rows, property guidance,
stable cross-table IDs, and plain setup instructions.

The public name says “Notion-ready” because the implementation imports through
CSV. It does not claim to be a Notion duplicate link or live integration.

## Implementation

- `notionKitTemplates.ts` owns the five templates and examples.
- `createCsvText.ts` escapes commas, quotes, and line breaks according to CSV
  rules.
- `createNotionKitTemplateCsv.ts` combines one template's header and rows.
- `NotionKitTemplateCard.tsx` downloads each browser-generated file.

No visitor data is required to create the files. The page does not call Notion,
Convex, R2, or an outside provider.

## Use Cases and Boundary

The kit can organize planning before a team has a dedicated content system. It
does not synchronize tables, store footage, publish posts, verify usage rights,
or replace the paid ClipStitchr asset and production workflow.

## File Tree

```text
web/app/(content)/tools/short-form-content-system-notion-kit/page.tsx
web/app/_components/tools/notion-kit/
web/lib/clipstitchr/tools/notionKit/
web/lib/clipstitchr/tools/csv/
```

See `docs/features/public-tools/portfolio/public-tool-quality-register.md` for candid release status.
