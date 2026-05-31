# Durable Server-side Media Processing

Reviewed: 2026-05-15

## Decision

ClipStitchr treats long-running media work as durable server-owned jobs, not as
page-local browser state.

The browser can start work and show progress, but once the app has uploaded a
durable source object or created a media job, the browser must not be required
to stay open for the workflow to finish.

This document covers the media side only: upload normalization, poster capture,
Stitchr rendering, Longr rendering, and final video preparation for provider
outputs. AI/provider orchestration, Replicate handoffs, and daily autopilot live
in `docs/backend/provider-automation-workflows.md`.

## Problem Solved

The previous architecture let the browser act as the workflow engine. That made
long-running work fragile:

- refreshing the page removed in-memory progress and queued `Blob` values;
- closing the tab stopped Media Bunny processing;
- sleeping the device stopped local rendering;
- Replicate or other providers could continue running while the app lost the
  finalization handoff;
- usage limits could be consumed even when no final asset was saved.

The durable media path fixes the media half of that problem:

```text
User starts media work
  -> durable source is uploaded or selected
  -> Convex creates a mediaJobs record
  -> worker claims the job
  -> worker processes media with FFmpeg
  -> worker uploads outputs/posters to R2
  -> worker writes final Convex records
  -> UI observes status from Convex
```

## Current Implementation

The implementation uses:

- Convex `mediaJobs` records in `web/convex/mediaJobs.ts`.
- Media job validators in `web/convex/validators/mediaJob*.ts`.
- Worker-only mutation auth through `MEDIA_WORKER_SECRET`.
- A media worker entry point at
  `web/services/media-worker/runMediaWorker.mjs`.
- Worker env examples in `web/.env.worker.example`.

Current worker execution supports `stitchr-draft-finalization` jobs that save
editable Stitchr drafts and `clipr-finalization` jobs that normalize provider
videos. Upload normalization, Longr export, Swapr finalization, launch
coalescing, and dashboard job visibility remain follow-up phases.

Run the local worker with:

```bash
cd web
npm run media-worker
```

Required worker environment:

- `NEXT_PUBLIC_CONVEX_URL`
- `MEDIA_WORKER_SECRET`
- `AUTOMATION_WORKER_SECRET` when processing automation-owned media jobs
- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

Optional worker environment:

- `MEDIA_WORKER_ID`
- `MEDIA_WORKER_SCRATCH_DIR`
- `MEDIA_WORKER_POLL_INTERVAL_MS`
- `MEDIA_WORKER_LOCK_MS`
- `MEDIA_WORKER_FFMPEG_PATH`
- `MEDIA_WORKER_FFPROBE_PATH`

Deployment choices and where those variables live are documented in
`docs/backend/media-worker-deployment.md`.

## Media Job Types

| Job type | Durable source | Worker output |
| --- | --- | --- |
| `upload-normalization` | Planned original video uploaded to R2 as `raw-video` | Normalized 9:16 video, poster image, final `videoClips` record |
| `stitchr-draft-finalization` | Implemented saved UGC clips, one saved Demo clip, copied trims, and audio settings | Editable `stitches` draft records; automation does not render or persist final Stitchr MP4 clips |
| `stitchr-longr-export` | Planned saved sequence clips, copied trims, output metadata | One finished Stitch from the ordered Longr-mode sequence, poster image, final `stitches` record |
| `clipr-finalization` | Implemented provider-generated avatar video already copied to R2 and referenced by a Clipr job | Normalized final Clip video, poster image, final `videoClips` record |
| `swapr-finalization` | Planned provider output URL and Swapr metadata already recorded server-side | Normalized UGC clip, poster image, final `videoClips` record |

Clipr automation now has a provider-side executor and a first media-worker
finalization path. Swapr still needs provider polling/output-copy finalization
before its media step can be considered close-safe.

## Durability Boundaries

Durability starts at different points for different workflows:

| Workflow | Safe to close browser after |
| --- | --- |
| New video upload | The raw source upload finishes and the `upload-normalization` job exists in Convex |
| Stitchr | The `stitchr-draft-finalization` job exists in Convex |
| Stitchr Longr mode | The `stitchr-longr-export` job exists in Convex |
| Clipr final video preparation | The provider avatar video object is saved to R2 and the `clipr-finalization` job exists |
| Swapr final video preparation | The provider output URL/metadata is recorded and the `swapr-finalization` job exists |

Skipping resumable or multipart uploads leaves one intentional gap: a brand-new
local file is not close-safe until the browser finishes uploading the raw source
object and creates the job. After that point, the worker owns completion.

## Server Encoder Choice

Mediabunny is a TypeScript media library, not a hosted API. It remains the
browser-local media library, and its docs still matter for client-side preview
and any future browser-resume path. Cloning the Mediabunny repository does not
provide a queue, database, authentication, R2 ownership rules, retry handling, or
progress persistence.

The server worker uses FFmpeg instead of Mediabunny for encoding because plain
Node does not provide WebCodecs `VideoEncoder`. ClipStitchr supplies durable
workflow ownership through Convex, R2, and the worker service.

The worker imports the published packages and uses server-side IO when a job
needs media encoding:

- R2 source objects are downloaded to scratch disk before processing.
- FFmpeg performs server-side H.264/AAC encoding, normalization, posters, and
  concatenation for jobs that produce rendered media.
- Completed output and poster files are uploaded back to R2.
- Scratch files are deleted after completion or failure cleanup.

The worker runs a startup FFmpeg self-test. A target runtime must include
`ffmpeg`, `ffprobe`, `libx264`, and AAC encoding before it should accept
production media-rendering jobs. Current Stitchr automation finalization does
not render video; it saves editable draft metadata and leaves export rendering
to the existing browser path. This is required because plain Node does not
provide WebCodecs `VideoEncoder`; Mediabunny remains useful for browser-local
media paths, but rendered server media jobs need a container-native encoder.

## Runtime Model

Video encoding should not run inside Vercel functions, Next.js route handlers,
Edge functions, plain Cloudflare Workers, or Convex Actions.

Use one of these executor models instead:

- Long-running worker in a container or VM, using the current polling command.
- Cloud Run Job or similar batch job, using `--once --max-jobs=N`.
- Cloudflare Container, after adding the Cloudflare deployment wrapper.
- Self-hosted machine for low-usage/private beta operation.

`docs/backend/media-worker-deployment.md` tracks the hosting tradeoffs, including
Cloud Run Jobs, Cloudflare Containers, OCI Always Free VMs, and self-hosting.

## Rate Limits And Ownership

Media job creation must stay server-gated:

- authenticate the user;
- verify ownership of every selected source asset;
- consume rate limits before expensive work starts;
- apply per-user active job caps;
- copy mutable user selections into the job payload;
- keep worker mutations protected by `MEDIA_WORKER_SECRET`;
- create final records only after worker-owned R2 outputs exist.

Relevant limits are documented in `docs/backend/rate-limits.md`:

- raw R2 upload signed URL and byte limits;
- media job create limits;
- media input byte limits;
- media output second limits;
- active media job concurrency;
- final Convex record-save limits.

Rate limits are not a replacement for access control. Ownership checks still
must happen before creating or completing jobs.

## Remaining Media Work

The media worker is the correct architectural direction, but these items remain
before treating it as production-complete:

1. Add production deployment for the worker.
   The repo has the worker code and command, but not a Cloud Run, Cloudflare
   Container, Docker, or systemd deployment wrapper.

2. Deploy bounded batch mode through Cloud Run Jobs.
   The worker supports `npm run media-worker -- --once --max-jobs=3`; the
   remaining work is packaging it as a Cloud Run Job.

3. Add job-trigger coalescing.
   If a user queues 20 uploads, the backend should not start 20 separate Cloud
   Run Job executions. Use the coalescing gate described in
   `docs/backend/media-worker-deployment.md`.

4. Benchmark the target runtime.
   The startup codec self-test proves capability, not throughput. Test realistic
   UGC, Demo, Clipr, and Longr inputs on the chosen host.

5. Add scheduled recovery and cleanup.
   Stale locks, abandoned raw inputs, failed jobs, expired provider URLs, and
   old scratch files need scheduled cleanup and visibility.

6. Add resumable upload support if upload-close durability matters.
   Without multipart/resumable uploads, the only non-durable media gap is the
   initial raw source upload from the user's browser.

7. Complete audio-mixing support.
   Longr jobs with shared music are currently rejected. Persisted Clip/Stitch
   music-mixed exports are also rejected instead of using browser-local Media
   Bunny rendering.

8. Decide the failed-job quota policy.
   Current limits are consumed before work starts. That is safest for spend
   control, but product policy should decide if support/admin tooling can grant
   credits after infrastructure failures.

9. Add operational monitoring.
   Track queue depth, oldest queued job age, job duration, failure rate, worker
   heartbeat age, R2 upload failures, and codec self-test failures.

## What This Does Not Solve

This media pipeline does not, by itself, make AI/provider tasks fully durable.
For example:

- a provider prediction can still outlive a request if its prediction ID and
  finalization metadata are not recorded first;
- a provider output can expire before ClipStitchr copies it to R2;
- a daily autopilot task needs planning, eligibility checks, provider retries,
  and notification state before media finalization starts.

Those are provider/automation workflow concerns. See
`docs/backend/provider-automation-workflows.md`.

## References

- Product scope: `project-scope.md`
- Coding guidelines: `coding-guidelines.md`
- Mediabunny guide mirror: `docs/media-bunny/media-bunny-llms.md`
- Mediabunny API declarations: `docs/media-bunny/media-bunny-api.md`
- Durable workflow notes: `docs/backend/durable-workflows.md`
- Worker deployment notes: `docs/backend/media-worker-deployment.md`
- Provider/automation notes: `docs/backend/provider-automation-workflows.md`
- Rate limits: `docs/backend/rate-limits.md`
- Official Mediabunny docs: https://mediabunny.dev/guide/introduction
- Official Mediabunny reading docs:
  https://mediabunny.dev/guide/reading-media-files
- Official Mediabunny writing docs:
  https://mediabunny.dev/guide/writing-media-files
- Official Mediabunny codec docs:
  https://mediabunny.dev/guide/supported-formats-and-codecs
