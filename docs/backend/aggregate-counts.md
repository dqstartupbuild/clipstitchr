# Aggregate Counts

ClipStitchr uses the Convex Aggregate component for library counters that must
show total available content, not only the current paginated page loaded in the
browser.

## Retrieved Component Docs

- Install command: `npm install @convex-dev/aggregate`
- Component docs: https://www.convex.dev/components/aggregate/aggregate.md
- LLM summary docs: https://www.convex.dev/components/aggregate/llms.txt
- Package version installed in `web/package.json`: `@convex-dev/aggregate`
  `^0.2.1`

The official component guidance is to keep denormalized counts and sums in a
component-owned data structure, update that structure in the same Convex
mutation as the source table write, and backfill existing rows with idempotent
aggregate writes before relying on the counts.

## Philosophy

The source of truth remains the Convex application tables. Aggregate counts are
a read model that makes total counters cheap and reactive.

Use Aggregate when a screen needs a total across records that are not all loaded
in the client. Do not count fetched arrays unless the UI is intentionally
showing a filtered subset that is already loaded, such as search results.

Every aggregate must answer three questions before it is added:

1. What table owns the source records?
2. What namespace isolates one user's data from another user's data?
3. What sort key or grouping key does the UI need to count?

For ClipStitchr library counts, the namespace is `ownerId`. Video counts use one
grouping key per surfaced asset type: `ugc`, `demo`, `clipr`, and `swapr`.
Stitches use a `null` key because they only need a per-user total.

## Current Setup

The Aggregate component is registered twice in
`web/convex/convex.config.ts`:

```ts
app.use(aggregate, { name: "videoClipCounts" });
app.use(aggregate, { name: "stitchCounts" });
```

The shared aggregate definitions live in `web/convex/aggregateCounts.ts`:

- `videoClipCounts` counts `videoClips` by `ownerId` and video library type.
- `stitchCounts` counts `stitches` by `ownerId`.

The read query lives in `web/convex/libraryCounts.ts`. It returns:

```ts
{
  cliprClips: number; // kept for compatibility; visible UI folds this into UGC
  demoClips: number;
  stitches: number;
  swapClips: number;
  ugcClips: number;
}
```

Generated non-demo Clipr output now counts as UGC. Legacy aggregate rows with
`libraryKind: "clipr"` are added into the returned `ugcClips` count and
`cliprClips` is returned as `0` for visible dashboard/library surfaces.

The client reads this query in `useClipLibraryState`. Display counts use the
larger value between the aggregate and the currently loaded page count so a
partially backfilled deployment never shows fewer items than the browser has
already fetched.

## Exact Setup Checklist

1. Install the package from `web/`.

```bash
npm install @convex-dev/aggregate
```

2. Register one named component per independent count surface in
   `web/convex/convex.config.ts`.

```ts
import aggregate from "@convex-dev/aggregate/convex.config.js";

app.use(aggregate, { name: "videoClipCounts" });
```

3. Run Convex codegen/deploy for the local deployment.

```bash
npx convex dev --once
```

4. Define `TableAggregate` instances in a dedicated Convex module. Use
   `ownerId` as the namespace for user-owned content.

```ts
export const stitchCounts = new TableAggregate<{
  DataModel: DataModel;
  Key: null;
  Namespace: string;
  TableName: "stitches";
}>(components.stitchCounts, {
  namespace: (stitch) => stitch.ownerId,
  sortKey: () => null,
});
```

5. Update every mutation that inserts, patches, or deletes source records. Use
   idempotent aggregate methods during rollout and migration:

- `insertIfDoesNotExist` after `ctx.db.insert`.
- `replaceOrInsert` after `ctx.db.patch` or replacement.
- `deleteIfExists` after `ctx.db.delete`.

6. Add or update a Convex query that reads aggregate counts. Keep authorization
   separate from counting; the query must derive `ownerId` from Convex auth.

7. Connect UI counters to the aggregate query result. Continue using loaded
   arrays only for intentionally filtered views, such as client-side search.

8. Backfill existing source tables after the write path is deployed. Run each
   mutation repeatedly with the returned `continueCursor` until `isDone` is
   `true`.

Development deployment:

```bash
npx convex run aggregateBackfills:backfillVideoClipCounts \
  '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run aggregateBackfills:backfillStitchCounts \
  '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run aggregateBackfills:backfillVideoClipLibraryKinds \
  '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
```

Production deployment, after the Convex functions containing these mutations
are deployed:

```bash
npx convex run aggregateBackfills:backfillVideoClipCounts \
  '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}' \
  --prod
npx convex run aggregateBackfills:backfillStitchCounts \
  '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}' \
  --prod
npx convex run aggregateBackfills:backfillVideoClipLibraryKinds \
  '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}' \
  --prod
```

For the next page, replace `cursor:null` with the quoted `continueCursor` value
returned by the prior run.

9. After the backfill is complete and verified, keep the idempotent methods in
   place unless there is a measured reason to switch to strict `insert`,
   `replace`, and `delete`. Idempotent writes make future repair runs safer.

## Required Environment Variables

The Aggregate component itself does not require new environment variables.

ClipStitchr still requires the existing Convex and auth variables documented in
`docs/backend/rate-limits.md`, including:

- `NEXT_PUBLIC_CONVEX_URL` in the Next.js runtime.
- `CLERK_JWT_ISSUER_DOMAIN` in the Convex deployment.
- `RATE_LIMIT_API_SECRET` in the Convex deployment for the operator-only
  aggregate backfill mutations.

## Verification Steps

1. Confirm the package is installed.

```bash
npm ls @convex-dev/aggregate
```

2. Regenerate/deploy Convex functions locally.

```bash
npx convex dev --once
```

3. Confirm generated API types include `components.videoClipCounts` and
   `components.stitchCounts`.

```bash
rg "videoClipCounts|stitchCounts" convex/_generated/api.d.ts
```

4. Run each aggregate backfill to completion in the target deployment.

5. Query counts for a known Clerk user ID.

```bash
npx convex run libraryCounts:get '{}' \
  --identity '{"subject":"<clerk-user-id>"}'
```

6. Open the dashboard and content library. The dashboard stats and unfiltered
   library section counters should show total UGC, demo, Swapr, Stitch, and Long
   counts before pressing "Load more". Generated Clipr UGC should be included
   in UGC.

7. Press "Load more". The visible cards should increase, but the section total
   should remain the same unless new content is created or deleted.

8. Run the local checks.

```bash
npm run lint
npm run typecheck
npm test -- useClipLibraryState.test.ts DashboardPageClient.test.tsx UploadsPageClient.test.tsx videoClips.test.ts stitches.test.ts mediaCollections.test.ts
```

## Adding Future Counts

Add a new aggregate when a future counter must represent records that are not
all loaded by the client. Reuse an existing aggregate only when the table,
namespace, and grouping key already match the new count.

For a new table:

1. Register a named component in `web/convex/convex.config.ts`.
2. Add a `TableAggregate` in `web/convex/aggregateCounts.ts` or a similarly
   focused aggregate definition file.
3. Update all source-table write mutations in the same patch.
4. Add a paginated backfill mutation.
5. Add the count to the relevant query return type and client state type.
6. Add tests for create, update, delete, backfill behavior, and UI display.
7. Update this document and `docs/backend/rate-limits.md`.
