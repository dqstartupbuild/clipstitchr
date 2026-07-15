# Provider Automation

Reviewed: 2026-06-01

## What Failed

The automated provider dispatch path was still route-based:

```text
Convex Cron
  -> automationScheduler.dispatchCoreProviders
  -> https://preview.clipstitchr.com/api/automation/*
  -> Replicate
```

Preview is protected before the Next.js app runs, so those calls receive a
Vercel authentication page instead of reaching the route handler. That explains
the Swapr and Clipr automation records staying queued/running with no Replicate
prediction IDs: the provider route never executed.

Stitchr completed because it was not using a provider step. The planner created
a media job directly, and the media worker saved an editable Stitchr draft. There
was no AI text overlay provider stage in that path, so completed automated
Stitchr drafts could have no generated text.

## Long-Term Standard

Do not bypass Preview protection for provider work. The standard shape is:

```text
Convex Cron or manual planner
  -> durable automationRuns / automationTasks
  -> provider worker claims tasks from Convex
  -> provider worker calls Replicate and writes provider state
  -> media worker handles FFmpeg/R2 media finalization
  -> user can leave the page while jobs continue
```

The provider worker does not need an inbound public HTTP endpoint. Cloud Run can
run it as a Job or long-running worker that polls Convex over outbound HTTPS.
That avoids Vercel protection entirely and keeps paid provider credentials out
of request-time UI flows.

## Secret Boundaries

Use separate secrets by responsibility:

| Secret | Runtime | Purpose |
| --- | --- | --- |
| `AUTOMATION_WORKER_SECRET` | Convex planner and trusted planner callers | Creates daily runs/tasks and consumes automation budgets |
| `PROVIDER_WORKER_SECRET` | Provider worker and Convex | Claims provider tasks, writes Replicate job state, and creates provider-owned media jobs |
| `MEDIA_WORKER_SECRET` | Media worker and Convex | Claims media jobs and writes media job state |
| `RATE_LIMIT_API_SECRET` | Next.js app routes and Convex | Lets authenticated app routes consume user-facing rate limits before expensive work |

`PROVIDER_WORKER_SECRET` should be generated independently from the existing
automation and media secrets.

## Implemented Worker Path

New provider worker command:

```bash
cd web
npm run provider-worker -- --once --max-jobs=3
npm run provider-worker -- --check
```

New local env template:

```bash
web/.env.provider.example
```

New container entrypoint:

```bash
web/services/provider-worker/Dockerfile
```

The worker now handles automated provider work for:

- Stitchr: generates text overlay plus caption/hashtag copy first, then creates
  the media-worker draft finalization job.
- Swapr: starts Replicate predictions and later finalizes succeeded provider
  outputs into media jobs.
- Clipr: runs script generation, avatar still generation, avatar video
  generation, stores intermediate outputs in R2, then creates the media job.
- Avatar photo automation: generates one new avatar photo from the latest
  default-avatar source photo and saves it to `photoAssets`.
- Swipr automation: generates editable slide text and saves a `swipes` draft.

Convex Cron still plans daily automation, but provider dispatch through protected
Next.js routes has been removed.

## Automation Feature Flags

Each automation tool has a code-level kill switch:

```ts
// web/lib/clipstitchr/constants/automationToolFeatureFlags.ts
export const automationToolFeatureFlags = {
  stitchr: true,
  swapr: false,
  clipr: true,
  "avatar-photo": true,
  swipr: true,
};
```

Set any tool to `false` to disable only that automatic generation path. Manual
tool usage is not affected. When a tool is disabled:

- Settings no longer renders that automation checkbox.
- Client and Convex preference saves remove the tool from `enabledTools`.
- Existing preferences that still contain the tool are filtered when read.
- The planner ignores users whose only enabled automation tools are disabled.
- Tool-specific planner calls skip instead of creating provider or media work.

`web/lib/clipstitchr/constants/isSwaprAutomationEnabled.ts` remains as a small
compatibility export for Swapr, but the flag map above is the source of truth.

## Default Avatar Automation

The default avatar is stored in Convex `avatarPreferences.defaultAvatarId`. Users
set it from the Avatars page with the star action next to the existing wardrobe,
voice, rename, and delete controls.

Manual tools use the default avatar as the initial selection, while still
allowing the user to choose a different avatar or photo for that run. Automated
avatar-based tools require the default avatar:

- Automatic Swapr uses the latest default-avatar photo as the source image.
- Automatic Clipr uses the default avatar, its default Clipr voice, and one
  default-avatar source photo.
- Automatic avatar photo generation queues only one generated photo for the
  default avatar. It no longer creates one run per avatar.

## Manual AI Worker Migration

Manual save-producing AI workflows now use the same durable shape:

```text
Browser action
  -> Next.js route authenticates and snapshots inputs
  -> route consumes rate limits before queued work
  -> route creates providerJobs or mediaJobs in Convex
  -> provider worker calls Replicate and records provider IDs
  -> media worker normalizes/finalizes video when needed
  -> final videos/photos are saved into the user's library
```

Implemented manual worker-owned flows:

- Swapr generation: `POST /api/swapr/generations` validates saved R2 photo and
  source clip segments, creates one `manual-swapr` provider job, and returns
  immediately. The provider worker starts/polls the segment predictions and the
  media worker stitches/normalizes the final saved Swapr clip.
- Clipr generation: `POST /api/clipr/jobs` creates a queued `cliprJobs` record
  plus one `manual-clipr` provider job. The provider worker owns script
  generation, avatar still generation, avatar video generation, optional music,
  and creation of the final media job.
- Video uploads: the browser uploads the original source video to R2, then
  `POST /api/uploads/jobs` creates an `upload-normalization` media job. The
  media worker normalizes the video, captures the poster, saves the library
  clip, and creates an `upload-video-analysis` provider job so metadata is
  filled in after the video exists.
- Avatar photo generation: `POST /api/avatars/photos/generate` stores the
  source image in R2 and creates an `avatar-photo-generation` provider job. The
  provider worker generates each variant, copies the outputs to R2, and saves
  `photoAssets` records.

The dashboard now displays active media/provider jobs, so a user who returns
while work is still running sees that background AI work is queued or running.
After completion, the final asset appears in the normal Library/Avatar views.

Manual job creation also requests an immediate Cloud Run worker execution
through a Convex internal dispatcher. The dispatcher also schedules a coalesced
delayed recovery launch 10 minutes after the launch target, and bounded workers
request a short continuation launch when they process a full batch. User-clicked
Swapr, Clipr, avatar photo generation, upload normalization, and upload analysis
should not wait for an external schedule tick.

Durability starts after the source upload and job creation finish. If the user
closes the browser before a brand-new local video or source image finishes
uploading to R2, the worker cannot recover that local file. Once the R2 upload
and Convex job creation have completed, the user can navigate away or close the
browser.

Swapr temporary reference segments must stay in R2 after a queued provider job
is created. The browser may clean them up only if queue creation fails; deleting
them immediately after a successful queue leaves the provider worker with stale
R2 keys and causes Replicate input fetches to fail with 404.

## Cloud Run Shape

Deployed Preview/dev worker jobs:

| Job | Schedule | Secret boundary |
| --- | --- | --- |
| `clipstitchr-provider-worker` | Convex immediate dispatch plus coalesced delayed recovery and bounded continuations | `PROVIDER_WORKER_SECRET` plus Replicate/R2 secrets |
| `clipstitchr-media-worker` | Convex immediate dispatch plus coalesced delayed recovery and bounded continuations | `MEDIA_WORKER_SECRET` plus R2 secrets |

The provider secret was generated with `openssl rand -base64 32`, written to
Convex and Google Secret Manager without printing it, and granted only to the
Cloud Run worker service account. The deployed media worker no longer receives
`AUTOMATION_WORKER_SECRET`.

Cloud Run Job command:

```bash
npm run provider-worker -- --once --max-jobs=3
```

Required runtime environment:

```bash
NEXT_PUBLIC_CONVEX_URL=...
PROVIDER_WORKER_SECRET=...
REPLICATE_API_TOKEN=...
R2_ACCOUNT_ID=...
R2_BUCKET_NAME=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

Required Convex dispatch environment:

```bash
CLOUD_RUN_PROJECT_ID=clipstitchr
CLOUD_RUN_LOCATION=us-central1
CLOUD_RUN_PROVIDER_WORKER_JOB=clipstitchr-provider-worker
CLOUD_RUN_MEDIA_WORKER_JOB=clipstitchr-media-worker
CLOUD_RUN_DISPATCH_CLIENT_EMAIL=...
CLOUD_RUN_DISPATCH_PRIVATE_KEY=...
```

Operational notes:

- Trigger immediately from the coalesced Convex dispatcher. Keep any external
  Cloud Scheduler sweep slow and optional because Convex delayed recovery now
  covers normal missed dispatch and stale-lock recovery.
- Keep max jobs bounded so one execution cannot monopolize provider spend.
- Use Secret Manager for secrets and IAM for deploy/run access.
- Logs should include task IDs and tool names, never secret values.

## Deployment Verification

Preview/dev deployment:

```text
Convex: neighborly-beagle-365
Google Cloud project: clipstitchr
Region: us-central1
```

Verification performed:

- Convex functions were pushed with `npx convex dev --once`.
- `npm run typecheck`, `npm run lint`, targeted automation tests, full
  `npm test -- --run`, and `npm run build` passed during the worker migration.
- Provider and media worker images were pushed to Artifact Registry.
- `clipstitchr-provider-worker` was deployed and scheduled.
- `clipstitchr-media-worker` was redeployed with the media-only secret set.
- Manual executions processed the stuck Preview automation backlog.

Current automated run state after the worker executions:

| Tool | State |
| --- | --- |
| Stitchr | completed; 3 editable Stitchr draft media jobs completed |
| Swapr | completed; Replicate provider job recorded and media finalization completed |
| Clipr | completed; script, avatar still, avatar video, and media finalization completed |
| Avatar photo | no run was created because the tool was not enabled/eligible for the current preferences |
| Swipr | skipped because Swipr automation is disabled in the current preferences |

## Remaining Request-Scoped AI

The long-running, save-producing manual flows are worker-owned. A few
short-lived editor-assist routes still return immediate response bodies because
their current UI contract requires the generated value before the user can
continue editing:

- Swipr background generation and analysis;
- standalone Clipr/Swipr/Stitchr text suggestion route;
- shared music upload, selection, and picker tracks;
- product enrichment while creating/updating products;
- Swapr photo outpainting before saving a source photo;
- legacy image-upload analysis for photo/avatar uploads.

Those should move behind the same `providerJobs` contract when their UI is
changed to show a queued job and reconcile the completed output. They no longer
block the main close-safe flows for manual Swapr, manual Clipr, video upload
normalization plus analysis, avatar photo generation, or daily automation.
