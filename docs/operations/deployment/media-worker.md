# Media Worker Deployment

Reviewed: 2026-07-12

The media worker is a separate runtime from the Next.js app and from Convex.
It runs `npm run media-worker`, claims queued `mediaJobs` records from Convex,
downloads source media from R2, processes files with FFmpeg, uploads outputs
and posters back to R2, and completes the final Convex records.

The worker claims durable jobs through
`workerQueue/claimNextWorkerQueueEntry:claimNextWorkerQueueEntry`. Keep that
nested Convex reference in
`web/services/media-worker/mediaWorkerQueueApiReference.mjs` and cover it with
the adjacent contract test. Convex maps files inside `convex/workerQueue/` to
slash-delimited function paths. The legacy
`workerQueue:claimNextWorkerQueueEntry` path does not resolve and makes a Cloud
Run execution exit before it can claim queued media work.

This document covers deployment for media execution only. Provider orchestration
and daily autopilot planning are documented in
`docs/operations/automation/provider-workflows.md`.

## Environment Ownership

There are three separate environment stores:

| Runtime | Local development | Production |
| --- | --- | --- |
| Next.js app | `web/.env.local` | Vercel project environment variables |
| Convex functions | `npx convex env set ...` or Convex dashboard | Convex deployment environment variables |
| Media worker | `web/.env.worker.local` loaded by `npm run media-worker` | The worker host's secrets/env system |
| Provider worker | `web/.env.provider.local` loaded by `npm run provider-worker` | Google Cloud Run / Secret Manager / IAM |
| Automation experiments | `web/.env.automation.local` | Google Cloud Run / Secret Manager / IAM |

Do not rely on Vercel secrets for the worker. Vercel secrets are only available
to the Vercel-hosted Next.js runtime. Do not rely on `web/.env.local` for the
worker either. The local worker command loads `web/.env.worker.local`; production
worker hosts must receive the same values through their own secret/env system.

## Local Worker Env

Copy the tracked example:

```bash
cd web
cp .env.worker.example .env.worker.local
```

Fill in:

```bash
NEXT_PUBLIC_CONVEX_URL=...
MEDIA_WORKER_SECRET=...
R2_ACCOUNT_ID=...
R2_BUCKET_NAME=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
# Optional, only for authenticated api.replicate.com Swapr output reads.
REPLICATE_API_TOKEN=...
```

Then run:

```bash
npm run media-worker
```

To verify local support without claiming jobs, run:

```bash
npm run media-worker -- --check
```

For Cloud Run-style bounded execution, run:

```bash
npm run media-worker -- --once --max-jobs=3
```

`MEDIA_WORKER_SECRET` must be the same value in `web/.env.worker.local` and in
the Convex deployment when processing automation-owned media jobs.
`REPLICATE_API_TOKEN` is optional for public `replicate.delivery` output URLs
and required only when a Swapr finalization job must fetch an authenticated
`api.replicate.com` output URL.

The server worker uses FFmpeg for media encoding because plain Node does not
provide WebCodecs `VideoEncoder`. Locally, install FFmpeg and FFprobe. In Cloud
Run, include them in the worker container image. The startup check requires
`libx264` and AAC encoding. Stitchr text overlays additionally need an FFmpeg
build with the `drawtext` filter. Override binary paths with
`MEDIA_WORKER_FFMPEG_PATH` and `MEDIA_WORKER_FFPROBE_PATH` only when needed.
Normalization keeps the first video stream and first audio stream only, so
mobile uploads with extra unsupported camera audio tracks can still process.

To check local text-overlay support:

```bash
ffmpeg -hide_banner -filters | grep drawtext
```

If that prints nothing, Stitchr exports without text overlays can still run, but
Stitchr exports with text overlays will fail until the worker uses an FFmpeg
build compiled with `drawtext`/libfreetype support. Set
`MEDIA_WORKER_FFMPEG_PATH` to the supported binary if more than one FFmpeg build
is installed.

## Convex Env

Convex must be able to verify worker-only mutations such as job claiming,
heartbeats, completion, failure, and stale-lock recovery.

Set the shared worker secret in Convex:

```bash
cd web
npx convex env set MEDIA_WORKER_SECRET "..."
```

The existing Convex deployment environment still needs normal app variables such
as `RATE_LIMIT_API_SECRET` and Clerk issuer configuration when those functions
are used.

Convex does not need the media worker's R2 access keys for the current worker
path. The worker uses R2 credentials directly.

## Production Recommendation

Use a long-running container/VM or bounded Cloud Run Job for the media worker.
The worker is designed as a poller, not as a short request handler, so it needs
a process that can stay alive long enough to claim work, use scratch disk, and
perform CPU-heavy media work.

Recommended starting options:

| Option | Fit | Notes |
| --- | --- | --- |
| Cloudflare Containers | Good if you want to keep worker compute near R2 and stay in the Cloudflare stack | Requires Workers Paid plan and container usage billing. Use `standard-2` or larger for real video tests; benchmark before choosing a size. |
| Low-cost VPS with Docker or systemd | Good MVP choice when predictable always-on behavior matters | Not free, but simple and reliable. Put env vars in the service manager or host secret store. |
| Own machine, NAS, or spare mini PC | Best true $0 path if you control hardware | Reliable only while the machine is online. Use launchd, systemd, Docker, or pm2 to restart the worker. |
| OCI Ampere A1 Always Free VM | Best hosted no-monthly-bill candidate if capacity is available | Oracle documents 3,000 OCPU hours and 18,000 GB hours per month for Ampere A1 Always Free compute, equivalent to 4 OCPUs and 24 GB memory for Always Free tenancies. Requires staying inside Always Free limits and watching capacity/budget settings. |
| Google Cloud Run Jobs | Recommended managed batch path | Requires a billing account. The worker now supports bounded `--once --max-jobs=N` execution, which fits Cloud Run Jobs. Google documents monthly free-tier vCPU/RAM seconds, but usage above the free tier is billable. |
| Render paid background worker | Viable managed option | Render's free services are not for production background workers; use a paid worker instance. |

The current Preview/dev deployment uses a Cloud Run Job named
`clipstitchr-media-worker` with `npm run media-worker -- --once --max-jobs=3`.
Convex dispatches that job immediately when media work is queued and schedules a
short 3-second follow-up when an immediate launch is coalesced, plus a coalesced
delayed recovery launch 10 minutes after the launch target. See
`docs/operations/reliability/worker-dispatch-recovery.md` for the current recovery model and
future queue-based dispatch option.

Avoid these as the primary media worker:

- Cloudflare Workers request handlers: useful for orchestration, not for the
  Media Bunny encode path. Workers have CPU and memory limits, and queue/cron
  invocations are not a good place for multi-minute media rendering.
- Vercel functions: the app can create jobs, but video processing should not run
  inside request-time functions.
- Free sleeping web-service tiers: they can pause, restart, or suspend, which
  makes queued media jobs feel unreliable.

## Cloudflare Notes

Cloudflare can host this, but use Cloudflare Containers, not plain Workers.

Cloudflare Containers provide a Linux-like container runtime and can run Node,
write scratch files, and keep a process alive for a configured `sleepAfter`
window. Container instances are started and routed through Workers/Durable
Objects, and charges are based on provisioned memory/disk and active CPU usage
while the container is running.

The repository currently contains the worker command and runtime code, not a
Cloudflare-specific deployment wrapper. A Cloudflare deployment still needs a
Dockerfile, Wrangler configuration, a small Worker/Durable Object launcher, and
secret wiring that passes the worker variables into the container.

For ClipStitchr, that means one of these deployment shapes:

- Always-on worker container: start one named container instance and keep it
  alive. This is the closest match to the current polling worker, but it is not
  a free service.
- Scheduled wake-up: use a Workers Cron Trigger to start a container
  periodically and let it drain queued jobs before sleeping. This is cheaper for
  sparse usage, but users may see delayed processing.
- Queue-triggered container launcher: future option if job dispatch moves from
  Convex-only polling to Cloudflare Queues or a small Worker endpoint.

If using Cloudflare Containers, store secrets with Workers Secrets or Secret
Store, then pass them to the container as environment variables. The container
must receive the same variables listed in `web/.env.worker.example`.

## Free Tier Reality

There is no truly free and reliable always-on service for this media worker.
Video processing needs CPU, memory, scratch disk, and outbound network access.
Free tiers usually have one or more of these problems:

- they sleep when idle;
- they restart at any time;
- they lack background-worker support;
- they have CPU/runtime limits;
- they suspend after monthly usage is exhausted;
- they require a billing account and can still charge for overages.

For demos, local development, and very low traffic, a free or trial service can
be useful. For production, choose a small paid container/VM and cap concurrency
and rate limits before provider or media work starts.

## No-Paid Low-Usage Alternatives

If the requirement is "no paid plan and no always-on cloud bill," choose one of
these explicit compromises:

### Option 1: Self-host the Worker on Hardware You Own

Run the existing worker on a Mac, mini PC, NAS, or home server:

```bash
cd web
npm run media-worker
```

For a more durable local setup, run that command under `launchd` on macOS,
`systemd` on Linux, Docker Compose, or pm2. This keeps the current app design and
does not require a paid hosting plan.

Tradeoffs:

- Jobs only process while that machine is awake, online, and able to reach
  Convex and R2.
- Upload/download speed depends on the machine's network.
- You own OS updates, process restarts, and log collection.

This is the best $0 path for a founder-only MVP or a private beta where delayed
processing is acceptable.

### Option 2: OCI Ampere A1 Always Free VM

Oracle Cloud's Always Free Ampere A1 compute is the closest hosted option to a
real always-on worker without a monthly bill. Install Node and run the worker
under `systemd` or Docker.

Tradeoffs:

- Requires an Oracle Cloud account.
- Free capacity can be hard to get in some regions.
- You must keep resources inside Always Free limits.
- Use budgets, compartment quotas, and clear instance labels to avoid accidental
  paid resources.

### Option 3: Cloud Run Jobs Within the Free Tier

Cloud Run Jobs can be inexpensive or $0 at very low usage, but this is not a
"no billing account ever" option. The worker now supports bounded execution:

```bash
npm run media-worker -- --once --max-jobs=3
```

Run that command in the Cloud Run Job container when media work exists.

Tradeoffs:

- Requires Google Cloud billing setup.
- Usage above the free tier is billable.
- Requires job-trigger coalescing so bursts of media jobs do not launch one
  Cloud Run Job execution per asset.

### Option 4: Browser-Local Processing Fallback

The original browser-local Media Bunny path has no worker hosting cost, but it
does not satisfy the current durability goal. Processing stops if the browser
tab closes, the machine sleeps, or the browser kills background work.

Use this only if the product decision changes back to "free infrastructure over
browser-close durability."

## Cloud Run Job Trigger And Coalescing Plan

The target Google path is:

```text
mediaJobs.create*
  -> request media execution
  -> coalescing gate decides whether to launch a Cloud Run Job
  -> Cloud Run Job runs `npm run media-worker -- --once --max-jobs=N`
  -> worker claims jobs atomically from Convex
```

The coalescing gate is required because one user action can create many jobs. A
20-video upload or 20-UGC Stitchr batch should not launch 20 Cloud Run Job
executions.

Implemented coalescing behavior:

1. Media job creation writes the durable `mediaJobs` record first.
2. A Convex dispatcher requests execution after job creation.
3. The dispatcher checks the `workerLaunchState` coordination record.
4. If an immediate launch was requested within the last 15 seconds, the
   dispatcher coalesces the primary launch.
5. Otherwise, the dispatcher records `lastRequestedAt`, then schedules the
   Cloud Run Jobs API dispatch.
6. If an immediate launch was coalesced, the dispatcher records
   `lastCoalescedFollowupRequestedAt` and schedules one short 3-second follow-up
   dispatch for that coalescing window.
7. The dispatcher records `lastRecoveryRequestedAt` and schedules one delayed
   recovery dispatch 10 minutes after the launch target, coalesced per worker.
8. The Cloud Run Job processes a bounded batch with `--once --max-jobs=N`.
9. If a worker processes exactly `maxJobs`, it requests a short delayed
   continuation launch so larger bursts can keep draining.

Correctness comes from Convex job claiming, not from the launcher. It is safe if
two Cloud Run Job executions overlap because each worker must atomically claim a
queued job before processing it.

An external Cloud Scheduler sweep is optional after coalesced delayed recovery
is deployed. Keep it only as a slow disaster-recovery sweep; manual user actions
should not wait for it.

## Production Checklist

1. Choose the worker host.
2. Put `NEXT_PUBLIC_CONVEX_URL`, `MEDIA_WORKER_SECRET`, and R2 credentials in
   that host's secret/env system.
3. Put the same `MEDIA_WORKER_SECRET` in Convex.
4. Put Cloud Run dispatch variables in Convex when using Cloud Run Jobs:
   `CLOUD_RUN_PROJECT_ID`, `CLOUD_RUN_LOCATION`,
   `CLOUD_RUN_PROVIDER_WORKER_JOB`, `CLOUD_RUN_MEDIA_WORKER_JOB`,
   `CLOUD_RUN_DISPATCH_CLIENT_EMAIL`, and `CLOUD_RUN_DISPATCH_PRIVATE_KEY`.
5. Run `npm run media-worker` for a long-running host, or
   `npm run media-worker -- --once --max-jobs=N` for Cloud Run Jobs.
6. Confirm startup passes the FFmpeg support self-test.
7. Queue a short Clipr finalization and confirm the job moves from `queued` to
   `running` to `completed`.
8. Run a Hook Lab post analysis and confirm it completes without creating a
   media job or a saved Library clip.
9. Confirm temporary Hook Lab analysis video objects are removed after
   successful finalization or the final failed attempt, and scratch directories
   are removed on success and failure.
10. Confirm failed jobs show a clear error in the dashboard job panel.
11. Add host-level logs and restart policy before production traffic.

## Environment Targets

Each Convex deployment must dispatch to Cloud Run Jobs that point back to that
same Convex deployment through `NEXT_PUBLIC_CONVEX_URL`. Do not point dev Convex
at production worker jobs, because those workers will launch successfully but
claim work from production instead of draining dev queues.

Current Cloud Run targets:

- Production Convex `prod:whimsical-ptarmigan-764` dispatches to
  `clipstitchr-media-worker` and `clipstitchr-provider-worker`.
- Dev Convex `dev:neighborly-beagle-365` dispatches to
  `clipstitchr-dev-media-worker` and `clipstitchr-dev-provider-worker`.

## Sources

- Cloudflare Containers pricing:
  <https://developers.cloudflare.com/containers/pricing/>
- Cloudflare Containers lifecycle:
  <https://developers.cloudflare.com/containers/architecture/>
- Cloudflare Containers environment variables:
  <https://developers.cloudflare.com/containers/platform-details/environment-variables/>
- Cloudflare Containers env vars and secrets:
  <https://developers.cloudflare.com/containers/examples/env-vars-and-secrets/>
- Cloudflare Workers limits:
  <https://developers.cloudflare.com/workers/platform/limits/>
- Render free-service limitations:
  <https://render.com/docs/free>
- Render background workers:
  <https://render.com/docs/background-workers>
- Google Cloud Run overview:
  <https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run>
- Google Cloud Run pricing:
  <https://cloud.google.com/run/pricing>
- Oracle Cloud Always Free resources:
  <https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm>
