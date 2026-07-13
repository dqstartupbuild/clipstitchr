# 100 Hooks for App Demo Videos

## What It Does

The public route `/tools/100-app-demo-video-hooks` provides exactly 100 individually authored app-demo openings. Visitors can search or filter the collection, copy one hook, copy the whole collection, or download it as Markdown.

Every entry includes:

- One distinct, editable hook.
- A practical opening visual that hands the viewer into an app demo.
- A claim check that helps the user keep the opening honest.
- An angle label for filtering.

The ten angles are pain recognition, desired outcome, hidden friction, demo reveal, objection answer, mistake correction, before and after, founder perspective, workflow shortcut, and proof invitation. Each angle contains ten hooks.

## How It Works

`appDemoVideoHooks.ts` owns the finite collection. It does not call AI, import ClipStitchr's Hook library, or generate permutations from user data. `appDemoVideoHooksDefinition.ts` connects the collection to the shared collection-resource page, guide, FAQ, copy, download, email-capture, related-tool, and paid-account surfaces.

Search and category filters run in the browser. The hook data is already part of the page, and the visitor's search phrase is not sent to ClipStitchr.

## Paid Boundary

The resource helps with choosing and adapting an opening. It does not personalize a hook to an app, save an idea library, create footage, assemble variations, or export a finished ad. ClipStitchr's paid product remains the production workflow.

## Use Cases

- Find an opening that a founder's existing demo can support.
- Give a creator several meaningfully different angles to record.
- Pair a spoken hook with a clear first product visual.
- Review a draft hook for claims the footage cannot prove.

## Relevant Files

```text
web/app/(content)/tools/100-app-demo-video-hooks/
  page.tsx
  page.test.tsx
web/lib/clipstitchr/tools/appDemoVideoHooks/
  appDemoVideoHooks.ts
  appDemoVideoHooks.test.ts
  appDemoVideoHooksDefinition.ts
  appDemoVideoHooksFaqs.ts
```

Shared rendering lives under `web/app/_components/tools/resources/`. Catalog metadata lives in `web/lib/clipstitchr/tools/catalog/publicToolCatalog.ts`.

## Source References

The collection is original project copy based on the approved contract in `docs/features/public-tool-batch-16-50-design.md`. It does not claim that any line is proven to improve performance.

## Verification

The pure data test proves the exact count, unique IDs, unique titles, unique hook text, ten-angle distribution, and required visual and claim-check content. The page test verifies all 100 entries render with structured data, search/download controls, the exact lead source, related-tool links, canonical metadata, and the paid handoff.

The candid release status and next refinement are recorded in
`docs/features/public-tool-quality-register.md`.
