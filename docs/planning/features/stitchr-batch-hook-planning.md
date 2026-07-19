# Stitchr Batch Hook Planning

## What This Adds

Stitchr Batch now tries one batch-level hook-planning call after the batch tasks
are created. The planner sees every selected UGC/demo pair in the run, writes
distinct hook options for each stitch, and saves those options before the media
worker finishes the videos.

The worker path still stays durable. The API route schedules a delayed provider
fallback when tasks are created, then tries to run the provider worker directly
after foreground hook planning. If the foreground planner fails or misses a
task, the provider worker uses the existing per-stitch text generation fallback
for only that task and saves the fallback hook into the same history table.

## How It Works

1. `POST /api/stitchr/batch/generate` creates Stitchr automation tasks through
   `convex/stitchrBatch.ts` and requests a delayed provider fallback launch.
2. The route reads the new task snapshots through
   `convex/stitchrHookPlans.listBatchPlanningInputs`.
3. Tasks covered by an Idea recipe or legacy Template are skipped because the
   saved recipe already supplies the hook text.
4. Non-template tasks consume the `stitchrBatchHookPlanDaily` and
   `stitchrBatchHookPlanGlobalDaily` limits before any writing provider call.
5. `createStitchrBatchHookGeneration` sends one prompt containing all task
   contexts.
6. Parsed per-task plans are saved to `stitchrHookPlans` with source
   `batch_planner`.
7. The route calls `convex/workerDispatch.runWorkerFromApi` so the provider
   worker starts immediately when active task IDs exist.
8. Provider workers query `stitchrHookPlans.getByAutomationTaskForProvider`.
   Usable saved plans skip per-stitch writing. Missing, failed, or unusable
   plans fall back to `createCliprTextGeneration`.
9. Worker fallback generations are saved with source `worker_fallback`.

## Structured Idea Memory

Batch planning no longer treats raw winning-hook examples as copy-and-paste
memory. Convex selects at most eight ready, non-archived Hook Lab text
blueprints from the active product and shared Ideas. Product scope, use count,
and recent use/update time determine the order.

The selected blueprints are copied into each durable task snapshot. Prompt
formatting uses their reusable pattern, semantic slots, emotional job, cadence,
claim constraints, and source-specific exclusions, while deliberately omitting
`sourceText`. Foreground Batch planning and worker fallback therefore keep the
same structured memory even if an Idea changes while the batch is running.

## Hook History

`stitchrHookPlans` remains the durable generation envelope and stores:

- selected hook
- alternate hook options
- caption and hashtags
- creative angle and reason
- product and UGC/demo references
- provider model and prediction id
- source: batch planner, worker fallback, or manual
- the legacy option array and feedback fields for rollback compatibility

Every plan save also synchronizes its options into independent
`stitchrHookOptions` rows. Hook Lab Review reads those rows through an indexed,
cursor-paginated query. Each card can be selected, saved as an Idea, marked
**Not for me**, or undone without changing sibling cards.

**Not for me** adds that one hook to the product's rejected examples, which the
next Stitchr writing prompt uses as avoid memory. **Save idea** explicitly
creates an Idea and links it to the review option. Review feedback no longer
silently creates a Template.

## Hook Lab Page

Hook Lab lives at `/dashboard/hooks`. **Ideas** owns reusable inspiration and
recipes. **Review** owns the independent generated-hook inbox. Product writing
preferences remain available from the same page.

## File Tree

- `web/app/api/stitchr/batch/generate/route.ts` runs the API-first planner.
- `web/lib/clipstitchr/server/stitchr/dispatchStitchrBatchProviderWorkerFromApi.ts`
  directly starts the provider Cloud Run job through Convex.
- `web/lib/clipstitchr/constants/stitchrBatchProviderFallbackLaunchDelayMs.ts`
  stores the delayed provider fallback timing.
- `web/convex/stitchrHookPlans.ts` owns plan generation and compatibility
  fields.
- `web/convex/stitchrHookOptions/` owns normalized Review rows and independent
  feedback.
- `web/convex/schema.ts` defines the `stitchrHookPlans` table.
- `web/lib/clipstitchr/server/createStitchrBatchHookGeneration.ts` calls the
  writing provider.
- `web/lib/clipstitchr/server/createStitchrBatchHookGenerationPrompt.ts` builds
  the batch prompt.
- `web/lib/clipstitchr/server/parseStitchrBatchHookGenerationOutput.ts` parses
  per-task plans.
- `web/services/provider-worker/runProviderWorker.ts` uses saved plans and
  saves worker fallbacks.
- `web/app/dashboard/hooks/HookLabPageClient.tsx` renders the dashboard Hook Lab
  page.
- `web/app/_components/hooks/HookLabReviewGrid.tsx` paginates independent hook
  cards.
- `web/app/_components/hooks/HookLabReviewCard.tsx` owns one option's actions.
- `web/app/_components/hooks/HookLabWritingPreferencesDialog.tsx` edits product
  writing memory.

## Failure Behavior

- Batch task creation remains the source of durability.
- Task creation schedules a delayed provider fallback before foreground hook
  planning starts, so a route failure still leaves a worker launch behind.
- After hook planning, the route directly dispatches the provider Cloud Run job
  through Convex. If direct dispatch fails, the API response remains successful
  with `providerDispatchStatus: "fallback_scheduled"`.
- Planner failure records failed hook-plan rows when possible and still returns
  the batch response, because workers can fall back per stitch.
- Worker fallback only runs for tasks without a usable saved plan.
- Idea-recipe and legacy-Template batches do not run or rate-limit the hook
  planner.
- A retry carrying the same run key does not create a second batch. It returns
  the active task IDs, relaunches the provider worker for queued/text tasks,
  and relaunches the media worker for media-stage tasks. A new button press
  receives a new run key and can create another batch on the same day.
- A task marked completed without an output stitch ID is treated as inconsistent,
  repaired back to provider work, and relaunched instead of blocking the day as
  completed.
- Existing empty Stitchr finalization media jobs are requeued and relaunched so
  an idempotency hit cannot silently strand a task.

## Verification

Focused tests cover the batch route creating tasks, skipping template-only hook
planning, saving per-task planner output, keeping queued batches alive when hook
planning is rate-limited, and existing-run recovery:

```bash
cd web
npx vitest run app/api/stitchr/batch/generate/route.test.ts convex/stitchrBatch.test.ts convex/mediaJobs.test.ts
```

Direct-dispatch fallback coverage lives in:

```bash
cd web
npx vitest run app/api/stitchr/batch/generate/route.test.ts convex/stitchrBatch.test.ts convex/workerLaunch.test.ts
```
