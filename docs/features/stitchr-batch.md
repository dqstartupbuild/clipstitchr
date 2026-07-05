# Stitchr Batch

Stitchr Batch is the default Stitchr tab. It lets a signed-in user queue a
daily Stitchr batch from the Stitchr page at any time. It is separate from
scheduled Stitchr automation.

`Batch` is the in-app mode name and implementation term. Public copy should use
pain-led language such as "make several drafts" or "stop rebuilding the same
ad" unless it is directly explaining the UI label.

## What It Does

- Queues up to 10 Stitch drafts for the user's browser-local batch date.
- Works even when scheduled automation is turned off in Settings.
- Uses its own Stitchr Batch pair history so recent Hook/UGC and Demo pairings are
  avoided when better options exist.
- Can use a selected Stitchr template so every queued draft uses that
  template's saved text overlay style and caption copy instead of generated
  random text.
- Lets the user choose Batch text style, text color, background color, and
  outline color, including `Any` choices that vary drafts automatically.
- Schedules a delayed provider-worker fallback when tasks are queued, then the
  API route dispatches the provider worker directly after foreground hook
  planning so drafts start without waiting for the fallback.
- Saves finished drafts as normal Stitch library items, not as automation-owned
  outputs.
- Uses the saved product's Hook Lab examples when it generates text for drafts
  that do not use a selected template.
- Leaves Normal and Longr Stitchr modes available for manual editing.

## User Flow

1. The user opens `/dashboard/stitchr`.
2. The page starts on Batch mode unless the URL is launching a saved stitch,
   template, Hook/UGC clip, or Demo clip for direct editing.
3. The Template picker stays available in Batch mode. **None** is the default.
   Selecting a template in Batch mode does not switch the page into manual
   editing.
4. The Batch panel shows the current daily limit, text style controls, and a
   generation button.
5. When the user generates a batch, the client posts to
   `/api/stitchr/batch/generate`.
6. The API route authenticates the user, reads the selected Batch text style
   and browser time zone, asks Convex to plan the daily Stitchr batch for that
   local date, and schedules a delayed provider-worker fallback.
7. The route plans hooks in the foreground when the batch needs generated text,
   then directly dispatches the provider Cloud Run job through Convex.
8. Finished drafts appear in the user's library after the existing provider and
   media workers complete them.

## Text Style Behavior

Batch mode uses the same text style choice model as product automation:

- `Any` picks a deterministic style or color per queued task.
- Specific choices reuse the selected style or color for every queued task in
  that Batch run.
- Background and outline controls only apply when the resolved style supports
  those visual parts.

The selected choices are included in the Batch API request, normalized by
`readStitchrBatchGenerateRequest`, passed to `stitchrBatch.plan`, and stored in
each task input snapshot. When no selected template provides a saved overlay,
the provider worker uses those resolved values when it creates the final text
overlay.

## Template Behavior

When a template is selected, `stitchrBatch.plan` verifies the template belongs
to the signed-in user and copies its first non-empty text overlay plus saved
caption copy into every queued task. The provider worker skips Stitchr text
generation for those tasks, stretches the saved overlay across each new draft's
duration, and preserves the overlay text, placement, font size, style, and
colors. Pair selection still uses the user's current Hook/UGC and Demo library.

When no template provides copy, `stitchrBatch.plan` snapshots the product's Hook
Lab fields into each provider task. The provider worker reconstructs the product
profile from that snapshot before calling the shared Stitchr text-generation
prompt.

## Pair History Behavior

The batch planner builds eligible Hook/UGC and Demo candidates from the user's clip
library. It scores candidates using `stitchrBatchPairHistory`, then picks a
batch in this order:

1. Prefer pairs where both clips are unused in the current batch.
2. If needed, use pairs where one clip has not been used in the current batch.
3. Reuse pieces only when the library does not have enough variety.

Each completed Batch draft updates Batch pair history with the Hook/UGC clip, Demo
clip, batch date, and last-used time. This keeps future user-triggered batches
from repeating the same pieces over and over when there are other clips
available.

## Limits And Abuse Protection

Stitchr Batch uses separate Convex rate limits from scheduled automation:

- 10 Stitchr outputs per user per browser-local batch date.
- 1,000 Stitchr outputs globally per day.

The browser sends its IANA time zone in the Batch API request. The API uses
that time zone to compute the batch date, falling back to UTC only when the time
zone is missing or invalid. The per-user planning and final-save buckets are
keyed by owner and batch date so a late-night batch does not consume the next
local day's Batch run.

The scheduled automation planner still respects the daily generation window.
The Stitchr Batch tab does not; a signed-in user can press the batch button at
any time until their local daily Stitchr batch has already been queued or
completed.

The API route converts Convex rate-limit errors into HTTP `429` responses with
retry timing. The current limits and verification notes are tracked in
`docs/backend/rate-limits.md`.

## Dispatch Behavior

`stitchrBatch.plan` is still the durable source of truth. It creates or repairs
Batch tasks and asks `workerLaunch` for a delayed provider fallback. The
foreground API route then tries the faster path:

1. Create or recover active Stitchr Batch tasks.
2. Plan hooks directly for tasks without template text.
3. Call `workerDispatch.runWorkerFromApi` to run the provider Cloud Run job
   immediately.
4. Return success even if the direct dispatch fails, because the delayed
   provider fallback is already scheduled.

The JSON response includes `providerDispatchStatus`:

- `dispatched` means the direct provider dispatch call succeeded.
- `fallback_scheduled` means direct dispatch failed but the delayed fallback
  remains queued.
- `skipped` means Convex returned no active task IDs, such as an already
  completed daily batch.

## Relevant Code

- `web/app/dashboard/stitchr/StitchrPageClient.tsx` owns the page mode,
  default Batch selection, Batch text choices, and generate action.
- `web/app/_components/stitchr/StitchrBatchPanel.tsx` renders the Batch tab
  content.
- `web/app/_components/stitchr/StitchrBatchTextStylePanel.tsx` renders the
  Batch text style and color controls.
- `web/app/_components/stitchr/StitchrModeToggle.tsx` exposes Batch, Normal,
  and Longr modes.
- `web/app/api/stitchr/batch/generate/route.ts` authenticates the user, asks
  Convex to plan the run, plans hooks, and directly dispatches the provider
  worker when active tasks exist.
- `web/lib/clipstitchr/server/stitchr/getStitchrBatchDate.ts` converts the
  request timestamp into the user's browser-local batch date.
- `web/lib/clipstitchr/server/readStitchrBatchGenerateRequest.ts` reads the
  optional selected template ID, text styling, and browser time zone from the
  Batch API request.
- `web/lib/clipstitchr/client/generateStitchrBatch.ts` is the browser client
  wrapper for the Batch API route.
- `web/lib/clipstitchr/client/getBrowserTimeZone.ts` reads the browser IANA
  time zone for the Batch API request.
- `web/lib/clipstitchr/constants/stitchrBatchProviderFallbackLaunchDelayMs.ts`
  stores the delayed fallback timing used by the Batch API route.
- `web/lib/clipstitchr/server/stitchr/dispatchStitchrBatchProviderWorkerFromApi.ts`
  calls the Convex action that directly starts the provider Cloud Run job.
- `web/convex/stitchrBatch.ts` plans the tasks and requests the delayed
  provider fallback launch.
- `web/convex/workerDispatch.ts` owns the direct Cloud Run dispatch action used
  by the Batch API route and the scheduled worker fallback action.
- `web/convex/workerLaunch.ts` schedules the delayed fallback and coalesced
  recovery dispatches.
- `web/lib/clipstitchr/server/stitchr/getStitchrBatchRateLimitKey.ts` keeps
  the planning and media-worker final-save quota keys aligned by owner and
  batch date.
- `web/convex/stitchTemplates/getStitchTemplateBatchTextOverlay.ts` picks the
  reusable overlay from a saved template.
- `web/services/provider-worker/createStitchrTemplateTextOverlay.ts` adapts the
  saved overlay to each generated draft duration.
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
web/app/_components/stitchr/StitchrBatchTextStylePanel.tsx
web/app/_components/stitchr/StitchrModeToggle.tsx
web/app/api/stitchr/batch/generate/route.ts
web/app/api/stitchr/batch/generate/route.test.ts
web/app/dashboard/stitchr/StitchrPageClient.tsx
web/lib/clipstitchr/client/generateStitchrBatch.ts
web/lib/clipstitchr/client/getBrowserTimeZone.ts
web/lib/clipstitchr/constants/stitchrBatchGenerationLimits.ts
web/lib/clipstitchr/constants/stitchrBatchProviderFallbackLaunchDelayMs.ts
web/lib/clipstitchr/server/readStitchrBatchGenerateRequest.ts
web/lib/clipstitchr/server/stitchr/dispatchStitchrBatchProviderWorkerFromApi.ts
web/lib/clipstitchr/server/stitchr/getStitchrBatchDate.ts
web/lib/clipstitchr/server/stitchr/getStitchrBatchDate.test.ts
web/lib/clipstitchr/types/SavedStitchrMode.ts
web/lib/clipstitchr/types/StitchrMode.ts
web/lib/clipstitchr/utils/getInitialStitchrMode.ts
web/convex/automationStitchr.ts
web/convex/automationStitchrPairScoring.ts
web/convex/recordStitchrBatchPairHistory.ts
web/convex/rateLimiter.ts
web/convex/workerDispatch.ts
web/convex/workerLaunch.ts
web/lib/clipstitchr/server/stitchr/getStitchrBatchRateLimitKey.ts
web/convex/stitchTemplates/getStitchTemplateBatchTextOverlay.ts
web/convex/stitchrBatch.ts
web/convex/stitchrBatchRunId.ts
web/services/provider-worker/createStitchrTemplateTextOverlay.ts
```

## Maintenance Notes

- Keep the daily limit in
  `web/lib/clipstitchr/constants/stitchrBatchGenerationLimits.ts` so the
  UI, Convex planner, and rate limiter stay aligned.
- If the Batch API route changes its rate-limit behavior, update
  `docs/backend/rate-limits.md` in the same change.
- If persisted stitch modes change, keep `SavedStitchrMode` separate from
  `StitchrMode` so Batch remains a page mode, not a saved stitch render mode.
