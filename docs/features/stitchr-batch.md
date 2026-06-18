# Stitchr Batch

Stitchr Batch is the default Stitchr tab. It lets a signed-in user queue a
daily Stitchr batch from the Stitchr page at any time. It is separate from
scheduled Stitchr automation.

## What It Does

- Queues up to 10 Stitch drafts for the current batch date.
- Works even when scheduled automation is turned off in Settings.
- Uses its own Stitchr Batch pair history so recent UGC and Demo pairings are
  avoided when better options exist.
- Launches the provider worker after tasks are queued so the drafts can move
  through the existing provider and media worker flow.
- Saves finished drafts as normal Stitch library items, not as automation-owned
  outputs.
- Leaves Normal and Longr Stitchr modes available for manual editing.

## User Flow

1. The user opens `/dashboard/stitchr`.
2. The page starts on Batch mode unless the URL is launching a saved stitch,
   template, UGC clip, or Demo clip for direct editing.
3. The Batch panel shows the current daily limit and a single generation button.
4. When the user generates a batch, the client posts to
   `/api/stitchr/batch/generate`.
5. The API route authenticates the user, asks Convex to plan the daily Stitchr
   batch, and returns the queued task IDs.
6. Finished drafts appear in the user's library after the existing provider and
   media workers complete them.

## Pair History Behavior

The batch planner builds eligible UGC/Demo candidates from the user's clip
library. It scores candidates using `stitchrBatchPairHistory`, then picks a
batch in this order:

1. Prefer pairs where both clips are unused in the current batch.
2. If needed, use pairs where one clip has not been used in the current batch.
3. Reuse pieces only when the library does not have enough variety.

Each completed Batch draft updates Batch pair history with the UGC clip, Demo
clip, batch date, and last-used time. This keeps future user-triggered batches
from repeating the same pieces over and over when there are other clips
available.

## Limits And Abuse Protection

Stitchr Batch uses separate Convex rate limits from scheduled automation:

- 10 Stitchr outputs per user per day.
- 1,000 Stitchr outputs globally per day.

The scheduled automation planner still respects the daily generation window.
The Stitchr Batch tab does not; a signed-in user can press the batch button at
any time until their daily Stitchr batch has already been queued or completed.

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
- `web/convex/stitchrBatch.ts` plans the tasks and requests a provider worker
  launch.
- `web/convex/recordStitchrBatchPairHistory.ts` records completed Batch pair
  usage.
- `web/convex/automationStitchrPairScoring.ts` scores and spreads pair
  selection across available clips.
- `web/lib/clipstitchr/constants/stitchrBatchGenerationLimits.ts` stores the
  daily and global Batch generation limits.

## File Tree

```text
docs/features/stitchr-batch.md
web/app/_components/stitchr/StitchrBatchPanel.tsx
web/app/_components/stitchr/StitchrModeToggle.tsx
web/app/api/stitchr/batch/generate/route.ts
web/app/api/stitchr/batch/generate/route.test.ts
web/app/dashboard/stitchr/StitchrPageClient.tsx
web/lib/clipstitchr/client/generateStitchrBatch.ts
web/lib/clipstitchr/constants/stitchrBatchGenerationLimits.ts
web/lib/clipstitchr/types/SavedStitchrMode.ts
web/lib/clipstitchr/types/StitchrMode.ts
web/lib/clipstitchr/utils/getInitialStitchrMode.ts
web/convex/automationStitchr.ts
web/convex/automationStitchrPairScoring.ts
web/convex/recordStitchrBatchPairHistory.ts
web/convex/rateLimiter.ts
web/convex/stitchrBatch.ts
web/convex/stitchrBatchRunId.ts
```

## Maintenance Notes

- Keep the daily limit in
  `web/lib/clipstitchr/constants/stitchrBatchGenerationLimits.ts` so the
  UI, Convex planner, and rate limiter stay aligned.
- If the Batch API route changes its rate-limit behavior, update
  `docs/backend/rate-limits.md` in the same change.
- If persisted stitch modes change, keep `SavedStitchrMode` separate from
  `StitchrMode` so Batch remains a page mode, not a saved stitch render mode.
