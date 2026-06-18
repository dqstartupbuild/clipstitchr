# Stitchr Batch

Stitchr Batch is the default Stitchr tab. It lets a signed-in user queue the
same daily automated Stitchr run from the Stitchr page whenever the automation
planner allows it.

## What It Does

- Queues up to 10 automated Stitch drafts for the current automation date.
- Uses the user's saved automation settings, including whether Stitchr
  automation is enabled.
- Reuses the existing automation pair history so recent UGC and Demo pairings
  are avoided when better options exist.
- Launches the provider worker after tasks are queued so the drafts can move
  through the existing provider and media worker flow.
- Leaves Normal and Longr Stitchr modes available for manual editing.

## User Flow

1. The user opens `/dashboard/stitchr`.
2. The page starts on Batch mode unless the URL is launching a saved stitch,
   template, UGC clip, or Demo clip for direct editing.
3. The Batch panel shows the current daily limit and a single generation button.
4. When the user generates a batch, the client posts to
   `/api/stitchr/batch/generate`.
5. The API route authenticates the user, asks Convex to plan the daily Stitchr
   automation run, and returns the queued task IDs.
6. Finished drafts appear in the user's library after the existing automation
   workers complete them.

## Pair History Behavior

The batch planner builds eligible UGC/Demo candidates from the user's clip
library and automation settings. It scores candidates using the existing
automation pair history, then picks a batch in this order:

1. Prefer pairs where both clips are unused in the current batch.
2. If needed, use pairs where one clip has not been used in the current batch.
3. Reuse pieces only when the library does not have enough variety.

Each queued task updates the pair history with the UGC clip, Demo clip,
automation date, and last-used time. This keeps future automated batches from
repeating the same pieces over and over when there are other clips available.

## Limits And Abuse Protection

Stitchr Batch uses the same Convex rate limits as automated Stitchr planning:

- 10 Stitchr outputs per user per day.
- 1,000 Stitchr outputs globally per day.

The API route converts Convex rate-limit errors into HTTP `429` responses with
retry timing. The current limits and verification notes are tracked in
`docs/backend/rate-limits.md`.

## Relevant Code

- `web/app/dashboard/stitchr/StitchrPageClient.tsx` owns the page mode,
  default Batch selection, and generate action.
- `web/app/_components/stitchr/StitchrBatchPanel.tsx` renders the Batch tab
  content.
- `web/app/_components/stitchr/StitchrModeToggle.tsx` exposes Batch, Normal,
  and Longr modes.
- `web/app/api/stitchr/batch/generate/route.ts` authenticates the user and
  asks Convex to plan the run.
- `web/lib/clipstitchr/client/generateStitchrBatch.ts` is the browser client
  wrapper for the Batch API route.
- `web/convex/automationStitchr.ts` plans the tasks, records pair history, and
  requests a provider worker launch.
- `web/convex/automationStitchrPairScoring.ts` scores and spreads pair
  selection across available clips.
- `web/lib/clipstitchr/constants/automationStitchrGenerationLimits.ts` stores
  the daily and global Stitchr generation limits.

## File Tree

```text
docs/features/stitchr-batch.md
web/app/_components/stitchr/StitchrBatchPanel.tsx
web/app/_components/stitchr/StitchrModeToggle.tsx
web/app/api/stitchr/batch/generate/route.ts
web/app/api/stitchr/batch/generate/route.test.ts
web/app/dashboard/stitchr/StitchrPageClient.tsx
web/lib/clipstitchr/client/generateStitchrBatch.ts
web/lib/clipstitchr/constants/automationStitchrGenerationLimits.ts
web/lib/clipstitchr/types/SavedStitchrMode.ts
web/lib/clipstitchr/types/StitchrMode.ts
web/lib/clipstitchr/utils/getInitialStitchrMode.ts
web/convex/automationLimits.ts
web/convex/automationStitchr.ts
web/convex/automationStitchrPairScoring.ts
web/convex/rateLimiter.ts
```

## Maintenance Notes

- Keep the daily limit in
  `web/lib/clipstitchr/constants/automationStitchrGenerationLimits.ts` so the
  UI, Convex planner, and rate limiter stay aligned.
- If the Batch API route changes its rate-limit behavior, update
  `docs/backend/rate-limits.md` in the same change.
- If persisted stitch modes change, keep `SavedStitchrMode` separate from
  `StitchrMode` so Batch remains a page mode, not a saved stitch render mode.
