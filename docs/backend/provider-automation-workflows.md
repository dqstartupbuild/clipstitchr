# Durable Provider And Automation Workflows

Reviewed: 2026-06-01

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

- Clipr script, reaction, b-roll, avatar still, avatar video, voice, lip sync,
  and music generation.
- Swipr AI background generation and future automated Swipe creation.
- Avatar photo generation.
- Shared music generation.
- Swapr provider prediction finalization.
- Upload video/image analysis handoffs when provider calls are used.
- Daily autopilot runs for eligible users.

This document does not cover Media Bunny rendering details. Media processing is
documented in `docs/backend/server-side-media-processing.md`.

## Remaining Fragile Pattern

The largest save-producing manual and automated provider workflows are now
worker-owned. Some smaller editor-assist flows still behave like request-owned
provider workflows:

- A browser action calls a Next.js route.
- The route consumes rate limits and starts provider work.
- The route waits for the provider or returns enough data for the browser to
  save later.
- If the request, tab, or page state disappears at the wrong time, the provider
  may still complete but the app may not store the final output.

Known examples:

| Workflow | Current risk |
| --- | --- |
| Swipr background generation | The route waits for Replicate and streams the generated image back to the browser. The browser then analyzes, uploads, and saves. Refresh can lose the generated output before it becomes a saved background. |
| Swipr background analysis | The analysis route returns metadata for the browser to save with the background. Refresh can still interrupt the generated/uploaded background save path. |
| Standalone text suggestions | `POST /api/clipr/text` returns generated Clipr/Swipr/Stitchr text directly for the editor. It has no final asset save until the user applies/saves the result. |
| Existing-asset music regeneration | Clip, Stitch, and shared-library music regeneration routes still wait for provider output, copy it to R2, and return the created track metadata in one request. |
| Product enrichment | Product create/update waits for provider enrichment before saving. If the request fails after quota consumption, no durable product-enrichment retry exists. |
| Swapr photo expansion | The outpainted image is streamed back to the browser before the user saves it as a source photo. |
| Legacy upload image analysis | Photo/avatar image upload metadata analysis still runs in the request path before the browser saves the asset metadata. |

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
| Next.js / Vercel manual app routes | Vercel environment variables |
| Convex verification secrets | Convex dashboard or `npx convex env set` |
| Cloud Run provider services/jobs | Google Secret Manager or Cloud Run env/secrets |
| Cloud Tasks / Scheduler OIDC identity | Google IAM service accounts |
| Local automation experiments | `web/.env.automation.local` |

Secrets that must match across runtimes:

- `MEDIA_WORKER_SECRET`: media worker and Convex.
- `PROVIDER_WORKER_SECRET`: provider finalizers/executors and Convex.
- `AUTOMATION_WORKER_SECRET`: autopilot planners/executors and Convex.
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

Manual Clipr is now a server-owned workflow with recoverable steps:

1. Create a `clipr` automation run with product/avatar/mode/model/voice/duration
   and music snapshots.
2. Consume Clipr job, avatar still, and video limits before provider calls.
   Script mode also consumes hook/script and voice limits; music limits are
   consumed only when Script mode generates music.
3. Generate hook/script as a provider task for Script mode, or create a local
   visual plan for Reaction and B-roll.
4. Generate the avatar source still as a provider task and copy it to R2.
5. Generate avatar video and optional Script-mode music as provider tasks.
6. Copy provider outputs to R2 from a server-owned finalizer.
7. Create a `clipr-finalization` media job.
8. Mark the Clipr run complete only after the final `videoClips` record exists.

`POST /api/clipr/jobs` now handles request parsing, ownership checks, quota
consumption, Convex input loading, queued job persistence, and creation of one
`manual-clipr` provider job. The provider worker owns Script-mode planning,
visual-mode local plan creation, avatar still generation, avatar video/music
generation, shared music persistence, and creation of the `clipr-finalization`
media job. The media worker saves the final Clipr clip, strips audio for
Reaction and B-roll, and marks the provider job complete.

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

Avatar photo generation is finalized server-side:

1. Create one provider job per requested avatar photo variant.
2. Snapshot the source avatar photo, prompt variant, model, and quality.
3. Consume image generation limits before predictions start.
4. Copy completed provider outputs to R2.
5. Save `photoAssets` records idempotently.
6. Attach final photo IDs to the provider jobs.

This also supports future autopilot, because the planner can create avatar photo
tasks without requiring an open browser session.

Manual `POST /api/avatars/photos/generate` stores the source image in R2 and
creates an `avatar-photo-generation` provider job. The provider worker creates
one Replicate prediction per requested variant, copies outputs to R2, and saves
the final `photoAssets` records. Automated avatar photo tasks use the same
provider worker and final save path.

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

The provider automation executor now lives at
`web/services/provider-worker/runProviderWorker.ts` and runs with
`PROVIDER_WORKER_SECRET`. It polls Convex directly instead of posting to
Preview/Next.js routes, claims queued automation tasks, starts or polls
Replicate predictions, writes provider state back through provider-only Convex
mutations, and creates media finalization jobs only after provider output is
ready.

The provider worker owns automatic Stitchr text, Swapr provider create/finalize,
Clipr script/reaction/b-roll/avatar-image/avatar-video, avatar-photo
generation, and Swipr draft text generation. Avatar-based automation uses
`avatarPreferences.defaultAvatarId`; automatic avatar-photo generation queues
only that default avatar. It also owns manual Swapr, manual Clipr, manual
avatar-photo generation, and upload-video analysis through durable
`providerJobs`. Convex Cron still plans daily runs, but it no longer dispatches
provider work through `AUTOMATION_NEXT_BASE_URL`. Creating provider work now
schedules a coalesced Convex Cloud Run dispatch immediately; the 10-minute Cloud
Scheduler trigger is only a recovery sweep.

The first FFmpeg media worker lives at
`web/services/media-worker/runMediaWorker.mjs`. It claims queued media jobs with
`MEDIA_WORKER_SECRET`; for `clipr-finalization`, it normalizes the durable avatar
video to 9:16 H.264/AAC, strips audio when the input snapshot asks for silent
visual output, captures a poster, uploads both objects to R2, saves the final
Clipr `videoClips` record, and marks the automation task/run complete.
For `swapr-finalization`, it downloads one or more allowlisted Replicate output
URLs, normalizes/concatenates the video to the same saved-clip format, captures
a poster, uploads both objects to R2, saves a UGC-compatible `videoClips` record
with `swaprMetadata`, and marks either the automation task/run or the manual
provider job complete. For `upload-normalization`, it downloads the raw uploaded
source from R2, normalizes it, captures the poster, saves the `videoClips`
record, and creates the follow-on `upload-video-analysis` provider job.

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
- Clipr mode preference: Any, Script, Reaction, or B-roll;
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

- Provider job records now cover manual Swapr, manual Clipr, manual avatar
  photos, and upload-video analysis so those save-producing predictions have
  finalization metadata before they start.
- Add webhook routes for provider completion where available.
- Verify webhook signatures.
- Add idempotent finalizers that copy provider outputs to R2.
- Add recovery polling for succeeded-but-unfinalized provider jobs.
- Move remaining Swipr background, music regeneration, product enrichment,
  Swapr outpainting, and image-analysis saves out of browser-only finalization.

### Phase 2: Split Clipr Into Durable Steps

- Completed for manual and automatic Clipr through `manual-clipr` provider jobs,
  automation tasks, provider-worker R2 copies, and media-worker finalization.
- Remaining Clipr-adjacent work is standalone text suggestion and existing-clip
  music regeneration, which still return immediate editor results.

### Phase 3: Add Autopilot Planner

- Implemented: autopilot preferences, `automationRuns`, `automationTasks`, daily
  planner idempotency keys, and active dispatch for Stitchr, Swapr, Clipr,
  avatar photos, and Swipr draft generation.
- Implemented: per-tool automation code flags in
  `web/lib/clipstitchr/constants/automationToolFeatureFlags.ts`; disabling a
  tool hides its automation setting, filters saved preferences, and makes that
  planner skip without affecting manual tool usage.
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
