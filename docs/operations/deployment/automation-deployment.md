# Automation Deployment

## Recommendation

Use Convex Cron for the daily automation scheduler, not Vercel Cron.

Use Google Cloud Run Jobs for both the provider and media workers.

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
- The provider and media workers need provider credentials, FFmpeg, scratch
  disk, R2 access, or bounded CPU-heavy execution. They should not run inside
  Vercel Functions or Convex functions. Cloud Run Jobs match their existing
  bounded modes and can be invoked independently.

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

Convex job creation
  -> internal.workerDispatch.runWorker
      -> runs provider/media Cloud Run Jobs immediately
      -> schedules coalesced delayed recovery after each launch target

Optional slow Cloud Scheduler sweep
  -> Cloud Run Job
      -> claims queued or stale jobs only as an external disaster-recovery net
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

The planner cron can run every 30 minutes because the tool planners enforce the
single global UTC window. Provider and media dispatches happen from job
creation and worker continuations, not from the planner cron.

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

## Worker Hosting

Use separate provider and media Cloud Run Jobs in production. The provider job
handles provider-backed tools such as Swapr and Clipr. The media job handles
media processing. A shared worker or backend change requires deploying both
jobs unless the changed code can affect only one.

The bootstrap walkthrough below shows the media-specific secret setup in
detail. Build, deploy, and smoke-check the provider job with the exact retained
production environment and secret bindings in the repository-root
[`AGENTS.md`](../../../AGENTS.md). Do not enable automation after updating only
the media job.

Why this host:

- The worker already supports bounded batch mode:

```bash
npm run media-worker -- --once --max-jobs=3
```

- Cloud Run Jobs are built for finite container tasks.
- Cloud Scheduler can execute Cloud Run Jobs on a schedule.
- FFmpeg can be installed in the container image.
- Convex job claiming keeps overlapping executions safe.

### Direct social publishing provider shape

The provider job also owns `social-publish`, `social-status-reconcile`,
`social-capability-refresh`, and `social-analytics-refresh`. Include `social`
in `PROVIDER_WORKER_TOOLS`.

The provider runtime requires:

```bash
SOCIAL_PUBLIC_BASE_URL=https://your-production-domain.com
SOCIAL_TOKEN_ENCRYPTION_CURRENT_VERSION=1
INSTAGRAM_GRAPH_API_VERSION=v25.0
SOCIAL_ANALYTICS_TIKTOK_APIFY_ACTOR_ID=clockworks/tiktok-scraper
SOCIAL_ANALYTICS_APIFY_MAX_TOTAL_CHARGE_USD=0.5
SOCIAL_ANALYTICS_APIFY_URL_LIMIT=100
```

Bind these values from Secret Manager:

```text
SOCIAL_TOKEN_ENCRYPTION_KEYS
TIKTOK_CLIENT_KEY
TIKTOK_CLIENT_SECRET
```

Create or rotate the provider bindings with the existing
`create_or_update_secret` helper from the Cloud Run setup:

```bash
create_or_update_secret \
  clipstitchr-social-token-encryption-keys \
  "$SOCIAL_TOKEN_ENCRYPTION_KEYS"
create_or_update_secret \
  clipstitchr-tiktok-client-key \
  "$TIKTOK_CLIENT_KEY"
create_or_update_secret \
  clipstitchr-tiktok-client-secret \
  "$TIKTOK_CLIENT_SECRET"
```

Grant the provider job service account
`roles/secretmanager.secretAccessor` on those three exact secret names. Never
put their values in `--set-env-vars`, repository files, screenshots, or logs.

The same token key ring and current version must be present in the Next.js
runtime. `APIFY_TOKEN` remains the existing shared provider-worker secret and is
used by social analytics only when a user explicitly requests TikTok saves.

Next.js additionally needs `SOCIAL_PUBLISHING_PROVIDER`,
`TIKTOK_REDIRECT_URI`, `INSTAGRAM_CLIENT_ID`,
`INSTAGRAM_CLIENT_SECRET`, `INSTAGRAM_REDIRECT_URI`, and
`INSTAGRAM_WEBHOOK_VERIFY_TOKEN`. Register the exact callback, webhook,
deauthorization, and data-deletion URLs with each platform before testing.

This feature changes only provider-worker code. The media worker does not need a
redeploy unless separately shared code or its image changed.

## Cloud Run Job Setup

1. Choose the Google Cloud project and region, then enable the required APIs:

```bash
PROJECT_ID=your-project-id
REGION=us-central1
SCHEDULER_REGION=us-central1

gcloud config set project "$PROJECT_ID"
gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  cloudscheduler.googleapis.com \
  secretmanager.googleapis.com
```

2. Create the Artifact Registry Docker repository if it does not already exist,
   then configure Docker authentication for that region:

```bash
gcloud artifacts repositories create clipstitchr \
  --repository-format=docker \
  --location "$REGION" \
  --description="ClipStitchr container images"

gcloud auth configure-docker "$REGION-docker.pkg.dev"
```

3. Build and publish both worker images from the `web/` directory. The explicit
   platform matters on Apple Silicon Macs because Cloud Run requires a Linux
   x86_64-compatible image. The provider Dockerfile and full production
   deployment shape are documented in the repository-root `AGENTS.md`:

```bash
cd web
docker build \
  --platform linux/amd64 \
  -f services/provider-worker/Dockerfile \
  -t "$REGION-docker.pkg.dev/$PROJECT_ID/clipstitchr/provider-worker:latest" \
  .
docker push "$REGION-docker.pkg.dev/$PROJECT_ID/clipstitchr/provider-worker:latest"

docker build \
  --platform linux/amd64 \
  -f services/media-worker/Dockerfile \
  -t "$REGION-docker.pkg.dev/$PROJECT_ID/clipstitchr/media-worker:latest" \
  .
docker push "$REGION-docker.pkg.dev/$PROJECT_ID/clipstitchr/media-worker:latest"
```

4. Store worker secrets in Secret Manager. The shell variables in this example
   should come from your private local env files or password manager. Do not put
   secret values directly into `gcloud run jobs deploy --set-env-vars`, because
   job configuration changes can appear in Google Cloud audit logs.

`AUTOMATION_WORKER_SECRET` belongs in Convex and Vercel for the automation API
boundary. The media Cloud Run Job authenticates with `MEDIA_WORKER_SECRET` and
must not receive the automation secret.

```bash
MEDIA_WORKER_SECRET="..."
NEXT_PUBLIC_CONVEX_URL="https://your-convex-deployment.convex.cloud"
R2_ACCOUNT_ID="..."
R2_BUCKET_NAME="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
REPLICATE_API_TOKEN="..."

create_or_update_secret() {
  local name="$1"
  local value="$2"

  if gcloud secrets describe "$name" >/dev/null 2>&1; then
    printf "%s" "$value" | gcloud secrets versions add "$name" --data-file=-
  else
    printf "%s" "$value" | gcloud secrets create "$name" \
      --replication-policy=automatic \
      --data-file=-
  fi
}

create_or_update_secret clipstitchr-media-worker-secret "$MEDIA_WORKER_SECRET"
create_or_update_secret clipstitchr-r2-account-id "$R2_ACCOUNT_ID"
create_or_update_secret clipstitchr-r2-bucket-name "$R2_BUCKET_NAME"
create_or_update_secret clipstitchr-r2-access-key-id "$R2_ACCESS_KEY_ID"
create_or_update_secret clipstitchr-r2-secret-access-key "$R2_SECRET_ACCESS_KEY"
create_or_update_secret clipstitchr-replicate-api-token "$REPLICATE_API_TOKEN"
```

5. Allow the Cloud Run Job service account to read those secrets:

```bash
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")"
WORKER_SERVICE_ACCOUNT="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

for secret in \
  clipstitchr-media-worker-secret \
  clipstitchr-r2-account-id \
  clipstitchr-r2-bucket-name \
  clipstitchr-r2-access-key-id \
  clipstitchr-r2-secret-access-key \
  clipstitchr-replicate-api-token
do
  gcloud secrets add-iam-policy-binding "$secret" \
    --member "serviceAccount:$WORKER_SERVICE_ACCOUNT" \
    --role roles/secretmanager.secretAccessor
done
```

6. Create or update the Cloud Run Job:

```bash
gcloud run jobs deploy clipstitchr-media-worker \
  --image "$REGION-docker.pkg.dev/$PROJECT_ID/clipstitchr/media-worker:latest" \
  --region "$REGION" \
  --tasks 1 \
  --max-retries 1 \
  --cpu 2 \
  --memory 4Gi \
  --task-timeout 30m \
  --set-env-vars NEXT_PUBLIC_CONVEX_URL="$NEXT_PUBLIC_CONVEX_URL" \
  --set-secrets MEDIA_WORKER_SECRET=clipstitchr-media-worker-secret:latest,R2_ACCOUNT_ID=clipstitchr-r2-account-id:latest,R2_BUCKET_NAME=clipstitchr-r2-bucket-name:latest,R2_ACCESS_KEY_ID=clipstitchr-r2-access-key-id:latest,R2_SECRET_ACCESS_KEY=clipstitchr-r2-secret-access-key:latest,REPLICATE_API_TOKEN=clipstitchr-replicate-api-token:latest
```

7. Smoke-test both worker images. The provider job must already be deployed
   with the exact environment and Secret Manager bindings from `AGENTS.md`:

```bash
gcloud run jobs execute clipstitchr-provider-worker \
  --region "$REGION" \
  --args="--check"

gcloud run jobs execute clipstitchr-media-worker \
  --region "$REGION" \
  --args="--check"
```

8. Run a bounded batch manually:

```bash
gcloud run jobs execute clipstitchr-media-worker \
  --region "$REGION" \
  --args="--once,--max-jobs=3"
```

9. Allow the Scheduler service account to execute the Cloud Run Job:

```bash
SCHEDULER_SERVICE_ACCOUNT="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

gcloud run jobs add-iam-policy-binding clipstitchr-media-worker \
  --region "$REGION" \
  --member "serviceAccount:$SCHEDULER_SERVICE_ACCOUNT" \
  --role roles/run.invoker
```

10. Optionally schedule a slow external recovery sweep. The normal recovery path
    is Convex delayed dispatch, so this is only a disaster-recovery net. The Google
    Cloud documented path is Cloud Scheduler calling the Cloud Run Jobs run endpoint
    with OAuth:

```bash
gcloud scheduler jobs create http clipstitchr-media-worker-recovery-sweep \
  --location "$SCHEDULER_REGION" \
  --schedule="0 * * * *" \
  --uri="https://run.googleapis.com/v2/projects/$PROJECT_ID/locations/$REGION/jobs/clipstitchr-media-worker:run" \
  --http-method POST \
  --oauth-service-account-email "$SCHEDULER_SERVICE_ACCOUNT"
```

Use an hourly or slower interval only if you want an external safety net beyond
Convex delayed recovery. Existing every-10-minute worker sweeps can be paused or
deleted after delayed recovery is deployed and smoke-tested.

## Production Cutover From Preview

Use this when the preview branch and development Convex deployment are working
and you want the automation stack to run against production instead.

Important deployment differences:

- `npx convex env` defaults to the dev deployment. Use `--prod` for production
  Convex environment variables.
- `npx convex deploy` defaults to the production deployment unless
  `CONVEX_DEPLOY_KEY` points at a preview deployment.
- `AUTOMATION_NEXT_BASE_URL` belongs in Convex and should be the production
  Next.js app origin, for example `https://clipstitchr.com`, with no path.
- `NEXT_PUBLIC_CONVEX_URL` belongs in Vercel and Cloud Run. For production it
  must be the production Convex URL, not the development URL.
- The Cloud Run Job currently points at one Convex deployment at a time. If you
  still need the preview worker running, create separate preview and production
  Cloud Run Jobs, Scheduler jobs, and Secret Manager secrets instead of
  repointing the existing job.

1. Pause the Cloud Scheduler job before changing the worker target:

```bash
PROJECT_ID=clipstitchr
REGION=us-central1
SCHEDULER_REGION=us-central1

gcloud config set project "$PROJECT_ID"
gcloud scheduler jobs pause clipstitchr-media-worker-recovery-sweep \
  --location "$SCHEDULER_REGION"
```

2. Set production Convex environment variables. Use fresh production secret
   values unless you intentionally want to share secrets with preview:

```bash
cd web

AUTOMATION_WORKER_SECRET="..."
MEDIA_WORKER_SECRET="..."
PRODUCTION_APP_ORIGIN="https://clipstitchr.com"

npx convex env set --prod AUTOMATION_WORKER_SECRET "$AUTOMATION_WORKER_SECRET"
npx convex env set --prod MEDIA_WORKER_SECRET "$MEDIA_WORKER_SECRET"
npx convex env set --prod AUTOMATION_NEXT_BASE_URL "$PRODUCTION_APP_ORIGIN"
npx convex env set --prod AUTOMATION_GLOBAL_WINDOW_START_UTC "09:00"
npx convex env set --prod AUTOMATION_GLOBAL_WINDOW_END_UTC "13:00"
```

3. Deploy Convex production:

```bash
cd web
npx convex deploy
```

Confirm the production Convex dashboard shows these cron jobs:

- `plan core daily automation`

4. Set Vercel production environment variables and deploy/promote the
   production Next.js app. Production Vercel must use the production Convex URL:

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-production-convex-deployment.convex.cloud
NEXT_PUBLIC_SITE_URL=https://clipstitchr.com
AUTOMATION_WORKER_SECRET=...
RATE_LIMIT_API_SECRET=...
REPLICATE_API_TOKEN=...
R2_ACCOUNT_ID=...
R2_BUCKET_NAME=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

The `AUTOMATION_WORKER_SECRET` value in Vercel production must exactly match
the production Convex value from step 2.

5. Update the Cloud Run worker secrets to production values. If the Secret
   Manager entries already exist, this adds new secret versions:

The media job retains only its media-worker credential. Keep
`AUTOMATION_WORKER_SECRET` in Convex and Vercel; do not bind it to Cloud Run.

```bash
MEDIA_WORKER_SECRET="..."
NEXT_PUBLIC_CONVEX_URL="https://your-production-convex-deployment.convex.cloud"
R2_ACCOUNT_ID="..."
R2_BUCKET_NAME="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
REPLICATE_API_TOKEN="..."

create_or_update_secret() {
  local name="$1"
  local value="$2"

  if gcloud secrets describe "$name" >/dev/null 2>&1; then
    printf "%s" "$value" | gcloud secrets versions add "$name" --data-file=-
  else
    printf "%s" "$value" | gcloud secrets create "$name" \
      --replication-policy=automatic \
      --data-file=-
  fi
}

create_or_update_secret clipstitchr-media-worker-secret "$MEDIA_WORKER_SECRET"
create_or_update_secret clipstitchr-r2-account-id "$R2_ACCOUNT_ID"
create_or_update_secret clipstitchr-r2-bucket-name "$R2_BUCKET_NAME"
create_or_update_secret clipstitchr-r2-access-key-id "$R2_ACCESS_KEY_ID"
create_or_update_secret clipstitchr-r2-secret-access-key "$R2_SECRET_ACCESS_KEY"
create_or_update_secret clipstitchr-replicate-api-token "$REPLICATE_API_TOKEN"
```

6. Deploy both Cloud Run Jobs against production Convex while keeping their
   existing Secret Manager references. Use the exact provider deployment
   command in the repository-root `AGENTS.md`; it preserves the provider tool
   list, model IDs, Apify and Pexels settings, and provider-only secrets. Then
   deploy the media job:

```bash
gcloud run jobs deploy clipstitchr-media-worker \
  --image "$REGION-docker.pkg.dev/$PROJECT_ID/clipstitchr/media-worker:latest" \
  --region "$REGION" \
  --tasks 1 \
  --max-retries 1 \
  --cpu 2 \
  --memory 4Gi \
  --task-timeout 30m \
  --set-env-vars NEXT_PUBLIC_CONVEX_URL="$NEXT_PUBLIC_CONVEX_URL" \
  --set-secrets MEDIA_WORKER_SECRET=clipstitchr-media-worker-secret:latest,R2_ACCOUNT_ID=clipstitchr-r2-account-id:latest,R2_BUCKET_NAME=clipstitchr-r2-bucket-name:latest,R2_ACCESS_KEY_ID=clipstitchr-r2-access-key-id:latest,R2_SECRET_ACCESS_KEY=clipstitchr-r2-secret-access-key:latest,REPLICATE_API_TOKEN=clipstitchr-replicate-api-token:latest
```

7. Smoke-test production access for both workers:

```bash
gcloud run jobs execute clipstitchr-provider-worker \
  --region "$REGION" \
  --args="--check"

gcloud run jobs execute clipstitchr-media-worker \
  --region "$REGION" \
  --args="--check"

gcloud run jobs execute clipstitchr-media-worker \
  --region "$REGION" \
  --args="--once,--max-jobs=3"
```

The second command should complete successfully. If no production `mediaJobs`
are queued, it should log `Media worker processed 0 job(s).`

8. Resume the optional Scheduler after the production worker succeeds, if you
   kept one:

```bash
gcloud scheduler jobs resume clipstitchr-media-worker-recovery-sweep \
  --location "$SCHEDULER_REGION"
```

9. Verify production end-to-end:

```bash
cd web
npx convex logs --prod --history 200 --success
```

In the production Convex dashboard, confirm:

- `automationPreferences` has the test user enabled.
- `automationRuns` and `automationTasks` are created during the global UTC
  automation window.
- `mediaJobs` are claimed and completed by the Cloud Run worker.
- Cloud Run executions continue to succeed after Scheduler resumes.

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
- Keep production `SOCIAL_PUBLISHING_PROVIDER=post_bridge` until every item in
  `docs/features/social-publishing/platform-approval-and-launch.md` passes.
- Confirm the provider `--check` validates social secrets without printing
  them.
- Use authorized development accounts to smoke-test TikTok automatic video,
  TikTok inbox video, TikTok photo sound on/off, Instagram Reel, single image,
  carousel, status reconciliation, disconnect, and manual analytics.
- Confirm an ambiguous final publish becomes `outcome_unknown` and a recovery
  run performs status-only reconciliation.
- Confirm an inactive entitlement prevents provider initialization and
  Instagram's final `media_publish`.

## Sources

- Convex Cron Jobs: https://docs.convex.dev/scheduling/cron-jobs
- Convex Scheduled Functions: https://docs.convex.dev/scheduling/scheduled-functions
- Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
- Cloud Run Jobs on a schedule: https://docs.cloud.google.com/run/docs/execute/jobs-on-schedule
- Cloud Scheduler with Cloud Run: https://docs.cloud.google.com/run/docs/triggering/using-scheduler
