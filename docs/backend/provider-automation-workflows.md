# Durable Provider And Automation Workflows

Reviewed: 2026-05-15

## Purpose

This document covers the non-media side of ClipStitchr's durability problem:
AI/provider generation, provider output finalization, and future autopilot
content runs.

The media worker solves Media Bunny work after a durable media input exists. It
does not automatically solve provider workflows where Replicate, image models,
music models, or future automation steps continue outside the browser.

Core rule:

> Once ClipStitchr consumes quota or starts provider work, the browser must not
> be responsible for completing the workflow.

## Scope

This document covers:

- Clipr script, avatar still, avatar video, voice, and music generation.
- Swipr AI background generation and future automated Swipe creation.
- Avatar photo generation.
- Shared music generation.
- Swapr provider prediction finalization.
- Upload video/image analysis handoffs when provider calls are used.
- Daily autopilot runs for eligible users.

This document does not cover Media Bunny rendering details. Media processing is
documented in `docs/backend/server-side-media-processing.md`.

## Current Fragile Pattern

Several flows still behave like request-owned provider workflows:

- A browser action calls a Next.js route.
- The route consumes rate limits and starts provider work.
- The route waits for the provider or returns enough data for the browser to
  save later.
- If the request, tab, or page state disappears at the wrong time, the provider
  may still complete but the app may not store the final output.

Known examples:

| Workflow | Current risk |
| --- | --- |
| Clipr generation | The route performs text generation, avatar still generation, avatar video generation, optional music generation, and R2 copies in one request. Media finalization is durable after the avatar video object is saved, but the provider side before that still needs a durable executor/finalizer model. |
| Swipr background generation | The route waits for Replicate and streams the generated image back to the browser. The browser then analyzes, uploads, and saves. Refresh can lose the generated output before it becomes a saved background. |
| Avatar photo generation | Generated photos are returned to the client and saved through client-side upload/library logic. Refresh can interrupt final storage. |
| Shared music generation | Provider output must be copied into R2 and saved as a shared/user track. This should be finalized server-side with idempotency. |
| Swapr generation | Prediction ownership is recorded and pollable. The media finalization job improves the final output path, but provider completion should still prefer webhook or server-owned recovery over browser polling. |

Provider outputs are not a durable storage layer. ClipStitchr must copy them to
R2 promptly and save enough Convex metadata to recover or retry finalization.

## Target Architecture

Use Convex as the durable state ledger and use background executors for
provider work.

```text
User or autopilot starts work
  -> server authenticates and checks prerequisites
  -> server consumes rate limits before provider calls
  -> server snapshots inputs into a durable job/run
  -> executor starts provider work and stores provider IDs
  -> webhook or poller records provider completion
  -> finalizer copies provider outputs to R2
  -> finalizer saves app records or creates mediaJobs
  -> UI observes job/run state from Convex
```

The browser can display progress, but Convex job state is the source of truth.

## Recommended Job Model

Keep media jobs separate from provider/automation state.

Suggested tables:

- `providerJobs`: one external provider unit of work, such as a Replicate
  prediction or model call.
- `automationRuns`: one user-visible workflow, such as "daily Clipr for product
  X" or "generate Swipr background set".
- `automationTasks`: ordered or parallel steps inside a run.

Minimum fields:

- `id`
- `ownerId`
- `type`
- `status`
- `stage`
- `progress`
- `idempotencyKey`
- `source`
- `inputSnapshot`
- `provider`
- `providerModel`
- `providerPredictionId`
- `providerStatus`
- `providerOutputUrl`
- `outputObjects`
- `finalAssetIds`
- `attempt`
- `lockedBy`
- `lockedUntil`
- `error`
- `createdAt`
- `updatedAt`
- `completedAt`
- `finalizedAt`

`inputSnapshot` matters. A daily run must not change meaning if the user edits a
product or avatar while the run is in flight.

## Executor Choices

Use different executors for different work:

| Executor | Good for | Avoid for |
| --- | --- | --- |
| Next.js route | Fast synchronous validation and job creation | Waiting for long provider calls or final media processing |
| Convex mutation/query | Durable state, ownership checks, idempotency, realtime UI | Direct long-running provider calls |
| Convex action | Short orchestration and calling an external executor | Media encoding or workflows that can exceed action limits |
| Cloud Tasks + Cloud Run service | Provider calls, polling, webhooks, retries, one task at a time | Heavy local video rendering |
| Cloud Run Job | Batch provider work or media worker batch mode | Tiny steps that need low-latency HTTP response |
| Media worker | Media Bunny rendering and finalization | AI provider orchestration that does not need media processing |

For long-term reliability and scale, the strongest path is:

```text
Convex state ledger
  + Cloud Scheduler or Convex cron for planning
  + Cloud Tasks for queued provider work and retries
  + Cloud Run services for provider executors/finalizers
  + Cloud Run Jobs or media worker for Media Bunny work
```

## Environment And Credentials

The planned Google execution path has a dedicated example file:

```bash
web/.env.automation.example
```

Use it as the local template for provider executors, Cloud Run dispatchers, and
autopilot experiments:

```bash
cd web
cp .env.automation.example .env.automation.local
```

The production values live in separate places:

| Runtime | Secret store |
| --- | --- |
| Next.js / Vercel dispatcher routes | Vercel environment variables |
| Convex verification secrets | Convex dashboard or `npx convex env set` |
| Cloud Run provider services/jobs | Google Secret Manager or Cloud Run env/secrets |
| Cloud Tasks / Scheduler OIDC identity | Google IAM service accounts |
| Local automation experiments | `web/.env.automation.local` |

Secrets that must match across runtimes:

- `MEDIA_WORKER_SECRET`: media worker and Convex.
- `PROVIDER_WORKER_SECRET`: provider finalizers/executors and Convex once those
  worker-only mutations exist.
- `AUTOMATION_WORKER_SECRET`: autopilot planners/executors and Convex once those
  worker-only mutations exist.
- `RATE_LIMIT_API_SECRET`: Next.js/server executors and Convex for protected
  rate-limit consume mutations.

Google credentials should use Application Default Credentials locally when
possible:

```bash
gcloud auth application-default login
```

If an external host such as Vercel must call Google APIs directly, use Workload
Identity Federation where possible. A base64 service-account key env var is a
fallback, not the preferred production path.

## Clipr Durable Target

Clipr should become a server-owned workflow with recoverable steps:

1. Create a `clipr` automation run with product/avatar/voice/duration/music
   snapshots.
2. Consume Clipr job, script, avatar still, avatar video, and music limits
   before provider calls.
3. Generate hook/script as a provider task and save the script plan.
4. Generate the avatar source still as a provider task and copy it to R2.
5. Generate avatar video and optional music as provider tasks.
6. Copy provider outputs to R2 from a server-owned finalizer.
7. Create a `clipr-finalization` media job.
8. Mark the Clipr run complete only after the final `videoClips` record exists.

The current media finalization job is a useful downstream piece. The missing
piece is making the provider steps before `clipr-finalization` durable when the
browser or request disappears.

The current `POST /api/clipr/jobs` implementation is still route-local, but the
orchestration is split across focused modules in
`web/lib/clipstitchr/server/clipr/*`: request parsing, start-quota consumption,
Convex input loading, queued job persistence, script planning, avatar still
generation, avatar video/music generation, shared music persistence, analytics,
and failure cleanup are separate units. That split improves maintainability and
testability, but it does not replace the durable target above; provider execution
can still be interrupted by request/runtime failure until those steps move to a
recoverable worker/finalizer path.

## Swipr Durable Target

Swipr should not stream generated provider images back to the browser as the
only save path.

Target flow:

1. Create a `swipr-background-generation` provider job with product/preset
   snapshot and prompt metadata.
2. Consume Swipr generation limits before provider work.
3. Start the provider prediction and store the prediction ID.
4. Finalize by copying the output image to R2 server-side.
5. Run metadata analysis server-side or store deterministic metadata when using
   seeded/preset generation.
6. Save the `swiprBackgrounds` record.
7. Optionally create a `swipe` draft or autopilot output that references the
   saved background.

For carousel export, the current browser ZIP export can remain local until
server-side carousel rendering becomes a product requirement.

## Avatar Photo Durable Target

Avatar photo generation should be finalized server-side:

1. Create one provider job per requested avatar photo variant.
2. Snapshot the source avatar photo, prompt variant, model, and quality.
3. Consume image generation limits before predictions start.
4. Copy completed provider outputs to R2.
5. Save `photoAssets` records idempotently.
6. Attach final photo IDs to the provider jobs.

This also supports future autopilot, because the planner can create avatar photo
tasks without requiring an open browser session.

## Daily Autopilot Target

Autopilot should be a planner plus durable task queue, not a media worker.

Daily flow:

```text
Scheduler
  -> planner finds eligible users
  -> planner creates automationRuns with idempotency keys
  -> planner enqueues provider tasks
  -> provider executors create/copy outputs
  -> media jobs render final videos only when needed
  -> notifications tell the user content is ready
```

Eligibility should require at least:

- autopilot enabled;
- global automation window eligibility from `automation.md`;
- one saved product with enough strategy metadata;
- one avatar with at least one usable photo;
- selected tool preferences such as Clipr, Swipr, or both;
- spend/rate-limit budget available;
- no duplicate run for the same user/date/tool/product/avatar key.

The first Swapr automation executor lives at
`POST /api/automation/swapr/execute`. It is authorized with
`AUTOMATION_WORKER_SECRET`, claims one queued `swapr-video` automation task,
starts the Replicate prediction, records the provider job under the task owner,
and marks the task `provider-created`. Swapr provider polling lives at
`POST /api/automation/swapr/finalize`; it claims one `provider-created` Swapr
task, refreshes the Replicate job status, creates a `swapr-finalization` media
job when the provider succeeds, and marks provider failures against the
automation task/run.

The first Clipr automation executor lives at
`POST /api/automation/clipr/execute`. It is authorized with
`AUTOMATION_WORKER_SECRET`, claims one queued `clipr-video` automation task, and
runs the provider-side script, avatar source image, and avatar video steps using
the automation task snapshot. It writes the provider outputs to the Clipr job and
creates a `clipr-finalization` media job.

The first FFmpeg media worker lives at
`web/services/media-worker/runMediaWorker.mjs`. It claims queued media jobs with
`MEDIA_WORKER_SECRET`; for `clipr-finalization`, it normalizes the durable avatar
video to 9:16 H.264/AAC, captures a poster, uploads both objects to R2, saves
the final Clipr `videoClips` record, and marks the automation task/run complete.
For `swapr-finalization`, it downloads the allowlisted Replicate output URL,
normalizes the video to the same saved-clip format, captures a poster, uploads
both objects to R2, saves a UGC-compatible `videoClips` record with
`swaprMetadata`, and marks the automation task/run complete.

Recommended idempotency key:

```text
ownerId + localDate + tool + productId + avatarId + autopilotProfileVersion
```

The planner can run from Convex cron or Cloud Scheduler. For scale, use a small
planner that enqueues per-user tasks rather than doing all provider work inside
the planner itself.

## Automation Preferences

Before autopilot is exposed to users, add an explicit preferences model:

- enabled/disabled;
- tools enabled: Clipr, Swipr, later Stitchr/Longr;
- product selection mode;
- avatar selection mode;
- generation frequency;
- enabled tools and source selection preferences;
- maximum outputs per day/week;
- monthly spend or credit cap;
- approval mode: save as draft versus publish/send automatically;
- notification preference;
- fallback behavior when prerequisites are missing.

Autopilot should default to draft/save, not external publishing, until the user
explicitly opts into any externally visible action.

## Reliability Requirements

Every provider/automation finalizer must be idempotent:

- duplicate webhooks must not create duplicate assets;
- retries must return the existing final result when `finalizedAt` is set;
- provider output URLs should be copied to R2 once and then referenced from R2;
- source snapshots must be kept even if the user edits/deletes the live product
  or avatar later;
- failed steps should store a user-safe error plus internal diagnostic detail;
- cancellation should stop future steps and ignore late provider webhooks where
  possible.

Use webhooks where the provider supports them. Keep polling as recovery, not as
the only finalization path.

## Rate Limits And Abuse Protection

Automation can create cost without a user actively clicking. Add limits before
autopilot runs:

- per-user daily autopilot run limit;
- per-user weekly/monthly generated asset limit;
- global provider spend or generated-seconds cap;
- per-tool concurrency caps;
- per-user queued/running automation cap;
- provider-specific retry caps;
- R2 upload byte caps for finalized outputs;
- final Convex record-save caps.

Autopilot should check budget before creating provider predictions, not after.
If a run is skipped because of budget or missing prerequisites, store a skipped
state so the user and support tools can explain why no content was generated.

Update `docs/backend/rate-limits.md` whenever these limits are implemented.

## Things Easy To Overlook

- Provider output retention. Copy provider outputs to R2 promptly.
- Webhook verification. Reject untrusted webhook events.
- Duplicate provider callbacks. Use idempotency and `finalizedAt`.
- Job coalescing. A burst of 20 user actions should not launch 20 separate Cloud
  Run Job executions when one batch run can drain the queue.
- Snapshot drift. Store product/avatar/settings snapshots on the run.
- Deletes during jobs. Decide whether in-flight jobs continue with snapshots or
  cancel when a user deletes the source asset.
- Spend visibility. Store enough cost units to explain rate-limit usage.
- Retry policy. Separate retryable provider/network failures from permanent
  prompt/input failures.
- User messaging. Show queued/running/failed/completed states after page reload.
- Notifications. Autopilot needs a way to tell users content is ready.
- Approval gates. Generated content should be saved as draft unless the user
  explicitly enables automated publishing.
- Storage cleanup. Remove abandoned provider temp objects, raw inputs, failed
  output objects, and superseded drafts.
- Observability. Track queue age, provider latency, failure rate, retry count,
  finalization latency, and daily autopilot skipped reasons.

## Implementation Phases

### Phase 1: Stop Provider Output Loss

- Add provider job records or extend existing `replicateJobs`/`cliprJobs` so
  every provider prediction has finalization metadata before it starts.
- Add webhook routes for provider completion where available.
- Verify webhook signatures.
- Add idempotent finalizers that copy provider outputs to R2.
- Add recovery polling for succeeded-but-unfinalized provider jobs.
- Move Swipr background and avatar photo saves out of browser-only finalization.

### Phase 2: Split Clipr Into Durable Steps

- Keep the existing `cliprJobs` user-facing state, but make each provider step
  resumable.
- Save provider prediction IDs before waiting for completion.
- Copy avatar still, avatar video, and music outputs to R2 from server-owned
  finalizers.
- Create `clipr-finalization` media jobs only after provider outputs are durable.

### Phase 3: Add Autopilot Planner

- Add autopilot preferences.
- Add `automationRuns` and `automationTasks`.
- Add daily planner with idempotency keys.
- Start active dispatch with Stitchr, Swapr, and Clipr. Avatar photos and Swipr
  stay planned but held until their durable executors are implemented.
- Save outputs as drafts and notify the user.
- Add admin/support visibility into skipped, failed, and retried runs.

### Phase 4: Scale Executors

- Add Cloud Tasks and Cloud Run services for provider steps if route-local
  execution becomes unreliable or too slow.
- Add Cloud Run Jobs or a container worker for media batch execution.
- Add queue-depth coalescing and global spend controls.

## References

- Durable media processing: `docs/backend/server-side-media-processing.md`
- Media worker deployment: `docs/backend/media-worker-deployment.md`
- Durable workflow notes: `docs/backend/durable-workflows.md`
- Rate limits: `docs/backend/rate-limits.md`
- Replicate webhooks: https://replicate.com/docs/webhooks
- Replicate webhook setup:
  https://replicate.com/docs/topics/webhooks/setup-webhook
- Replicate webhook retries:
  https://replicate.com/docs/topics/webhooks/receive-webhook
- Replicate data retention:
  https://replicate.com/docs/topics/predictions/data-retention
- Cloud Tasks overview: https://cloud.google.com/tasks/docs
- Cloud Tasks queue configuration:
  https://cloud.google.com/tasks/docs/configuring-queues
- Cloud Scheduler overview: https://cloud.google.com/scheduler/docs/overview
- Cloud Run Jobs: https://docs.cloud.google.com/run/docs/create-jobs
- Convex cron jobs: https://docs.convex.dev/scheduling/cron-jobs
