# Automation Deployment

## Recommendation

Use Convex Cron for the daily automation scheduler, not Vercel Cron.

Use Google Cloud Run Jobs for the media worker.

Reasoning:

- The automation planner is Convex-owned work. It reads Convex preferences,
  writes `automationRuns` and `automationTasks`, consumes Convex rate-limit
  buckets, and relies on Convex idempotency. Keeping the scheduler in Convex
  avoids a public HTTP cron hop for the main planning loop.
- Convex Cron jobs are defined in `convex/crons.ts` and can call internal Convex
  functions directly.
- Vercel Cron is useful for Vercel-hosted HTTP maintenance routes, but Vercel
  triggers cron jobs by making an HTTP `GET` request to a production deployment
  path from `vercel.json`. That is a worse fit for this planner because the work
  is not a public web request and the existing automation routes use `POST`.
- The media worker needs FFmpeg, scratch disk, R2 access, and bounded CPU-heavy
  execution. It should not run inside Vercel Functions or Convex functions.
  Cloud Run Jobs match the existing `npm run media-worker -- --once` mode and
  can be scheduled or invoked independently.

Current scope:

- Active automation tools: Stitchr, Swapr, Clipr.
- Held automation tools: avatar photo generation and Swipr.
- Stitchr automation saves editable drafts only. It does not render final MP4
  stitches.

## Scheduler Shape

The committed scheduler shape is:

```text
Convex Cron
  -> internal.automationScheduler.planCoreDaily
      -> plans Stitchr, Swapr, Clipr only
  -> internal.automationScheduler.dispatchCoreProviders
      -> calls Next.js provider worker routes for Swapr and Clipr

Cloud Scheduler
  -> Cloud Run Job
      -> npm run media-worker -- --once --max-jobs=N
      -> claims queued mediaJobs from Convex
      -> saves editable Stitchr drafts or final Swapr/Clipr clips
```

The planner runs repeatedly and depends on idempotency keys. Repeated scheduler
ticks should return existing runs rather than creating duplicates.

## Convex Cron Setup

1. Set Convex environment variables:

```bash
cd web
npx convex env set AUTOMATION_WORKER_SECRET "..."
npx convex env set MEDIA_WORKER_SECRET "..."
npx convex env set AUTOMATION_NEXT_BASE_URL "https://your-production-domain.com"
npx convex env set AUTOMATION_GLOBAL_WINDOW_START_UTC "09:00"
npx convex env set AUTOMATION_GLOBAL_WINDOW_END_UTC "13:00"
```

2. Keep the same `AUTOMATION_WORKER_SECRET` in Vercel. Convex dispatch actions
use it when calling the worker-only Next.js automation routes.

3. Deploy Convex:

```bash
cd web
npx convex deploy
```

4. Confirm the cron definitions are visible in the Convex dashboard after
deployment:

- `plan core daily automation`
- `dispatch core provider automation`

The planner cron can run every 30 minutes because the tool planners enforce the
single global UTC window. Provider dispatch can run more often because it only
claims already-created tasks.

## Vercel Setup

Deploy the Next.js app normally to Vercel. Required production environment for
the active core automation routes:

```bash
AUTOMATION_WORKER_SECRET=...
NEXT_PUBLIC_CONVEX_URL=...
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
RATE_LIMIT_API_SECRET=...
REPLICATE_API_TOKEN=...
R2_ACCOUNT_ID=...
R2_BUCKET_NAME=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

Do not configure Vercel Cron for the core planner unless Convex Cron is
unavailable. If Vercel Cron is used as a fallback, create a small authenticated
`GET` route that calls the existing `POST /api/automation/plan` behavior or
calls Convex directly; do not expose the planner without a secret check.

## Media Worker Hosting

Use Cloud Run Jobs for the first production worker.

Why this host:

- The worker already supports bounded batch mode:

```bash
npm run media-worker -- --once --max-jobs=3
```

- Cloud Run Jobs are built for finite container tasks.
- Cloud Scheduler can execute Cloud Run Jobs on a schedule.
- FFmpeg can be installed in the container image.
- Convex job claiming keeps overlapping executions safe.

## Cloud Run Job Setup

1. Build and publish the worker image from the `web/` directory:

```bash
cd web
docker build \
  -f services/media-worker/Dockerfile \
  -t REGION-docker.pkg.dev/PROJECT_ID/clipstitchr/media-worker:latest \
  .
docker push REGION-docker.pkg.dev/PROJECT_ID/clipstitchr/media-worker:latest
```

2. Create or update the Cloud Run Job:

```bash
gcloud run jobs deploy clipstitchr-media-worker \
  --image REGION-docker.pkg.dev/PROJECT_ID/clipstitchr/media-worker:latest \
  --region REGION \
  --tasks 1 \
  --max-retries 1 \
  --set-env-vars NEXT_PUBLIC_CONVEX_URL="..." \
  --set-env-vars MEDIA_WORKER_SECRET="..." \
  --set-env-vars AUTOMATION_WORKER_SECRET="..." \
  --set-env-vars R2_ACCOUNT_ID="..." \
  --set-env-vars R2_BUCKET_NAME="..." \
  --set-env-vars R2_ACCESS_KEY_ID="..." \
  --set-env-vars R2_SECRET_ACCESS_KEY="..." \
  --set-env-vars REPLICATE_API_TOKEN="..."
```

Use Secret Manager instead of literal `--set-env-vars` values for production
secrets once the job is proven.

3. Smoke-test FFmpeg support:

```bash
gcloud run jobs execute clipstitchr-media-worker \
  --region REGION \
  --args="--check"
```

4. Run a bounded batch manually:

```bash
gcloud run jobs execute clipstitchr-media-worker \
  --region REGION \
  --args="--once,--max-jobs=3"
```

5. Schedule the Cloud Run Job. The Google Cloud documented path is Cloud
Scheduler calling the Cloud Run Jobs run endpoint with OAuth:

```bash
gcloud scheduler jobs create http clipstitchr-media-worker-every-10m \
  --location SCHEDULER_REGION \
  --schedule="*/10 * * * *" \
  --uri="https://run.googleapis.com/v2/projects/PROJECT_ID/locations/REGION/jobs/clipstitchr-media-worker:run" \
  --http-method POST \
  --oauth-service-account-email PROJECT_NUMBER-compute@developer.gserviceaccount.com
```

Start with every 10 minutes. Reduce the interval only after benchmarking FFmpeg
runtime and provider-output volume.

## Operational Checks

Before enabling users broadly:

- Confirm `POST /api/automation/plan` plans only Stitchr, Swapr, and Clipr.
- Confirm Convex Cron creates no duplicate runs for the same user/date/tool.
- Confirm Swapr provider polling does not hammer in-flight Replicate jobs.
- Confirm Cloud Run Job can complete `stitchr-draft-finalization`,
  `swapr-finalization`, and `clipr-finalization`.
- Confirm final media retries mark the automation task/run failed when exhausted.
- Confirm held tools, avatar photos and Swipr, are not exposed as active
  automation options and are not scheduled by the core planner.

## Sources

- Convex Cron Jobs: https://docs.convex.dev/scheduling/cron-jobs
- Convex Scheduled Functions: https://docs.convex.dev/scheduling/scheduled-functions
- Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
- Cloud Run Jobs on a schedule: https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule
- Cloud Scheduler with Cloud Run: https://docs.cloud.google.com/run/docs/triggering/using-scheduler
