# Database Read Reduction

This work reduces Convex Database I/O by keeping public lists, dashboard
hydration, library tabs, worker status views, and automation planning away from
large documents wherever possible.

## What Changed

- Blog list-style routes now read `blogPostCards`, a compact Convex read model
  maintained by `blogPosts.upsertPublishedArticle`.
- The old full-body `blogPosts.listPublishedBlogPosts` list query was removed
  so public list consumers cannot accidentally read every article body.
- `/blog`, `/blog/[slug]`, and `/sitemap.xml` use hourly revalidation instead
  of forced dynamic rendering.
- Dashboard home saves Stitch templates through `useCreateStitchTemplate`
  without subscribing to the full template list.
- Library template rows load only when the Library Stitches or Templates tabs
  need them.
- Dashboard library providers now track the active Library tab and skip hidden
  clip, photo, avatar, Swipr, Swipe, Stitch, and Pexels subscriptions.
- Library Hook Plan reads are active-product scoped and load only for the
  Stitches tab where hook review controls are rendered.
- Clip and Stitch paginated queries apply server-side row and byte ceilings via
  `getReadLimitedPaginationOpts`.
- Initial media library pages load 24 rows.
- Swipr UI background queries use smaller visible-list caps, while provider
  worker pack lookups keep the larger automation cap.
- The Pexels Library All tab reads global Pexels compact cards, not full
  background documents, so every current pack can be discovered while keeping
  the payload slim.
- Saved Swipes hydrate the exact compact background cards referenced by their
  visible Swipe records so older photos are not treated as missing just because
  they are outside the recent background list window.
- Dashboard summary source clip fan-out is capped to a smaller picker-sized
  set.
- Library clip, stitch, swipe, Swipr background, Clipr job, worker job,
  automation run, and automation task list reads now use compact card/summary
  tables instead of the full source rows.
- Worker and automation planner paths are bounded. Planning paths that still
  need full clip/product payloads for prompt snapshots read recent indexed
  windows instead of collecting every owner row.
- Avatar deletion, legacy product assignment, blog card rebuilds, and
  completion notifications now use bounded reads.
- High-read surfaces log Convex transaction metrics through
  `logConvexTransactionMetrics` when `ctx.meta.getTransactionMetrics()` is
  available.

## Read Models

Compact tables are maintained synchronously at source-table write points:

- `videoClipCards` from `videoClips`
- `stitchCards` from `stitches`
- `swipeCards` from `swipes`
- `swiprBackgroundCards` from `swiprBackgrounds`
- `productCards` from `products`
- `cliprJobSummaries` from `cliprJobs`
- `workerJobSummaries` from `providerJobs` and `mediaJobs`
- `automationRunSummaries` from `automationRuns`
- `automationTaskSummaries` from `automationTasks`
- `blogPostCards` from `blogPosts`

The card tables intentionally omit cold body/detail fields such as video
descriptions, Swipr background details, Swipe rationale, job input snapshots,
Clipr scripts/scene plans, and worker lock/idempotency internals. List search
uses precomputed `searchText` fields where a compact table omits searchable
source text.

Video clip cards derive `libraryKind` from the source clip when an older source
row does not yet store that field. This keeps `videoClipCards` rebuilds usable
for local and production deployments that have older upload data.

Full source rows are still used for detail/edit/export flows, provider and media
worker claims, and prompt-building paths that need the omitted payloads.

## Backfill

Existing rows need compact card/summary rows once after deployment. Run these
paginated backfills until `isDone` is `true` for each function:

```bash
cd web
npx convex run readModelBackfills:backfillBlogPostCards '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run readModelBackfills:backfillVideoClipCards '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run readModelBackfills:backfillStitchCards '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run readModelBackfills:backfillSwipeCards '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run readModelBackfills:backfillSwiprBackgroundCards '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run readModelBackfills:backfillProductCards '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run readModelBackfills:backfillCliprJobSummaries '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run readModelBackfills:backfillProviderWorkerJobSummaries '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run readModelBackfills:backfillMediaWorkerJobSummaries '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run readModelBackfills:backfillAutomationRunSummaries '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run readModelBackfills:backfillAutomationTaskSummaries '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
```

Append `--prod` when running against production.

Use each response's `continueCursor` as the next `paginationOpts.cursor`.

If the library counters show UGC or Demo clips but the matching tab is empty,
the aggregate counts are newer than the compact card read model. Run
`readModelBackfills:backfillVideoClipCards` to completion for that Convex
deployment, then refresh `/dashboard/library`.

## Intentional Full Reads

These paths still read source tables by design:

- `videoClips.get`, `stitches.get`, `swipes.get`, Swipr background detail
  mutations, Clipr job detail/status mutations, and worker `getForWorker`
  functions fetch full rows because editors, previews, exports, or workers need
  the omitted fields.
- Provider/media/automation worker claim functions read full payload rows, but
  candidate scans are capped at small windows.
- Stitchr and Stitchr Batch planning read bounded full UGC/Demo/product windows
  because the task snapshot includes descriptive fields used by provider prompt
  generation.
- Product-scoped UGC library pagination uses the same product/library-kind
  compact-card index shape as the other video tabs.

## Maintenance Notes

Do not add public list, sitemap, feed, dashboard, or library views that read
large body/detail documents by default. Add a compact read model when a screen
needs cards, counts, or summaries, and fetch full documents only after the user
opens an editor, preview, export, or detail page.

When a source table gains a new list-visible field, update the matching
`create*CardFields` or `create*SummaryFields` helper, the write-path upserts,
and the matching read-model backfill in the same change.
