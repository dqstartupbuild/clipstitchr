# App Category Hook Packs

## What It Does

The public route `/tools/app-category-hook-packs` offers six finite hook packs for fitness, finance, productivity, dating, education, and utility apps. Every pack contains exactly ten distinct fill-in structures, for 60 entries overall.

Each entry includes a bracketed structure, a category-specific filled example, and a reminder about risky claims common to that category. The reminders are practical writing checks, not legal, medical, financial, safety, or educational advice.

## How It Works

`appCategoryHookPacks.ts` owns all six packs. `appCategoryHookPacksDefinition.ts` connects them to the shared searchable collection page. Visitors can filter by category, search the text, and copy any individual structure while all six packs remain visible.

The staged control retains complete-set copy and Markdown download. In the approved `hybrid-v1` experience, accepted name-and-email capture unlocks the exact CSV category-pack collection in that browser. The CSV is built locally from the public pack data and contains no search input or contact information.

The packs are fixed local data. They do not import ClipStitchr's Hook library, call an AI service, or claim to predict performance.

## Paid Boundary

The resource supplies finite category context but does not personalize hooks to a specific app, save a Hook Lab collection, generate unlimited variants, create footage, or produce an ad. ClipStitchr remains paid production software.

## Use Cases

- Start with language that fits the app's category without making a category-wide promise.
- Give a creator a fill-in opening that still requires real product details.
- Notice sensitive claims before they reach a brief or shoot.
- Compare a category-specific angle with a broader hook framework.

## Relevant Files

```text
web/app/(content)/tools/app-category-hook-packs/
  page.tsx
  page.test.tsx
web/lib/clipstitchr/tools/appCategoryHookPacks/
  appCategoryHookPacks.ts
  appCategoryHookPacks.test.ts
  appCategoryHookPacksDefinition.ts
  appCategoryHookPacksFaqs.ts
```

The shared collection and format-aware portability UI lives in `web/app/_components/tools/resources/`. CSV creation lives in `web/lib/clipstitchr/tools/resources/createCollectionResourceCsv.ts`, and gate metadata lives in `web/lib/clipstitchr/tools/catalog/publicToolGateCatalog.ts`.

## Source References

The structures and examples are original project copy implementing `docs/features/public-tools/portfolio/public-tool-batch-16-50-design.md`. Category reminders intentionally avoid professional advice and unsupported performance claims.

## Verification

The pure data test enforces exactly 60 unique structures, six expected categories with ten entries each, bracketed fill-ins, examples, and category reminders. Shared gate tests verify all packs stay public while the hybrid CSV is locked, then appears after browser unlock. Route tests cover canonical metadata, structured data, control actions, exact lead source, related links, and the paid CTA.

The candid release status and next refinement are recorded in
`docs/features/public-tools/portfolio/public-tool-quality-register.md`.
