# Stitchr Batch Hook Planning

## What This Adds

Stitchr Batch now tries one batch-level hook-planning call after the batch tasks
are created. The planner sees every selected UGC/demo pair in the run, writes
distinct hook options for each stitch, and saves those options before the media
worker finishes the videos.

The worker path still stays durable. If the foreground planner fails or misses a
task, the provider worker uses the existing per-stitch text generation fallback
for only that task and saves the fallback hook into the same history table.

## How It Works

1. `POST /api/stitchr/batch/generate` creates Stitchr automation tasks through
   `convex/stitchrBatch.ts`.
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
7. Provider workers query `stitchrHookPlans.getByAutomationTaskForProvider`.
   Usable saved plans skip per-stitch writing. Missing, failed, or unusable
   plans fall back to `createCliprTextGeneration`.
8. Worker fallback generations are saved with source `worker_fallback`.

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

The Library `Hooks` tab reads this table, filters by product, and lets the user
copy, save as winner, or add to avoid list.

Accepting a hook adds it to the product's winning hook examples. Rejecting a hook
adds it to the product's rejected hook examples. The next Stitchr writing prompt
uses those product examples as prompt memory.

## Settings Hook Lab

Settings now shows Hook Lab directly under Product settings for the active
product. The product edit dialog still exists for full product edits, but Hook
Lab is visible because it is active writing memory, not a hidden product detail.

## File Tree

- `web/app/api/stitchr/batch/generate/route.ts` runs the API-first planner.
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
- `web/app/_components/library/HookLibraryTabSection.tsx` renders Library
  Hooks.
- `web/app/_components/settings/SettingsHookLabPanel.tsx` renders the visible
  Settings Hook Lab.

## Failure Behavior

- Batch task creation remains the source of durability.
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
