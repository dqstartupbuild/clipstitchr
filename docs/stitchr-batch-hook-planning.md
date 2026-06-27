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
3. Template-covered tasks are skipped because the template already supplies the
   hook text.
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

## Hook History

`stitchrHookPlans` stores:

- selected hook
- alternate hook options
- caption and hashtags
- creative angle and reason
- product and UGC/demo references
- provider model and prediction id
- source: batch planner, worker fallback, or manual
- feedback: accepted or rejected

The dashboard Hook Lab page reads this table, filters by product, and lets the
user copy, save as winner, or add to avoid list.

Accepting a hook adds it to the product's winning hook examples. Rejecting a hook
adds it to the product's rejected hook examples. The next Stitchr writing prompt
uses those product examples as prompt memory. When an accepted hook is tied to a
finished Stitch, ClipStitchr also saves that Stitch setup as a Template.

## Hook Lab Page

Hook Lab now has its own dashboard page at `/dashboard/hooks`. Settings keeps
product and automation controls, while Hook Lab owns product hook memory and
the saved hook history list.

## File Tree

- `web/app/api/stitchr/batch/generate/route.ts` runs the API-first planner.
- `web/lib/clipstitchr/server/stitchr/dispatchStitchrBatchProviderWorkerFromApi.ts`
  directly starts the provider Cloud Run job through Convex.
- `web/lib/clipstitchr/constants/stitchrBatchProviderFallbackLaunchDelayMs.ts`
  stores the delayed provider fallback timing.
- `web/convex/stitchrHookPlans.ts` owns hook-plan reads, writes, and feedback.
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
- `web/app/_components/hooks/HookLabHistorySection.tsx` renders saved hook
  history.
- `web/app/_components/hooks/HookLabMemoryPanel.tsx` renders active product hook
  memory.
- `web/convex/stitchTemplates/createAutomaticStitchTemplateFromAcceptedHookPlan.ts`
  creates Templates from accepted hook winners when a finished Stitch exists.

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
- Template batches do not run or rate-limit the hook planner.
- A repeat request for an already-running daily batch does not create a second
  batch. It returns the active task IDs, relaunches the provider worker for
  queued/text tasks, and relaunches the media worker for media-stage tasks.
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
