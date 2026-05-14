# Server-side Media Processing With Mediabunny

Reviewed: 2026-05-13

## Short Answer

Cloning the Mediabunny repository does not give ClipStitchr a hosted media API.
Mediabunny is a TypeScript media library, not a service with a REST API that can
be self-hosted as-is.

The right path is to host a ClipStitchr media-processing API and worker service
that imports the published `mediabunny` package. Clone or fork Mediabunny only if
we need to inspect its internals or change the library itself. For normal use,
keep `mediabunny` and extension packages installed from npm.

Server-side processing is feasible. The local API declarations and official docs
include server-side sources and targets:

- `FilePathSource` reads files in Node, Bun, or Deno.
- `FilePathTarget` writes files in Node, Bun, or Deno.
- `UrlSource`, `BufferSource`, `StreamTarget`, and `AppendOnlyStreamTarget` give
  other server-friendly IO options.
- Custom encoders and decoders can be registered when a runtime does not provide
  the codec through WebCodecs.

The caveat is speed. Mediabunny is fast in the browser because it can use native
WebCodecs and browser media/canvas primitives. Moving work to a server preserves
that speed only if the worker runtime can provide equivalent encode/decode
support, or if we run the existing browser pipeline inside a server-hosted browser
worker. A plain serverless function without reliable codec support is not enough.

## Sources Checked

- Local product scope: `project-scope.md`
- Local Mediabunny guide mirror: `docs/media-bunny/media-bunny-llms.md`
- Local Mediabunny API declarations: `docs/media-bunny/media-bunny-api.md`
- Durable job guidance: `docs/backend/durable-workflows.md`
- Rate-limit guidance: `docs/backend/rate-limits.md`
- Official repo: https://github.com/Vanilagy/mediabunny
- Official docs: https://mediabunny.dev/guide/introduction
- Official reading docs: https://mediabunny.dev/guide/reading-media-files
- Official writing docs: https://mediabunny.dev/guide/writing-media-files
- Official codec docs: https://mediabunny.dev/guide/supported-formats-and-codecs
- Cloudflare Containers limits:
  https://developers.cloudflare.com/containers/platform-details/limits/
- Cloudflare Workers limits:
  https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare Queues pull consumers:
  https://developers.cloudflare.com/queues/configuration/pull-consumers/
- Cloudflare Stream upload docs:
  https://developers.cloudflare.com/stream/uploading-videos/
- Convex Actions limits: https://docs.convex.dev/functions/actions

## What Cloning Mediabunny Enables

Cloning the repository can help with local research, debugging, or contributing
patches. It does not provide:

- A ready-made queue.
- A hosted media conversion API.
- A database schema.
- User authentication.
- R2 object ownership rules.
- Job retry, locking, cron cleanup, or progress persistence.

ClipStitchr has to provide those pieces.

Use the npm package for the worker:

```bash
npm install mediabunny @mediabunny/aac-encoder
```

Keep a fork only if there is a specific missing feature or bug fix. If a fork is
distributed, check Mediabunny's license obligations before publishing the worker
image.

## Required Architecture

Use a durable worker model, not Next.js route-local processing.

```text
Browser
  uploads raw media to R2 with signed URLs
  creates a durable job record
  subscribes to Convex job status

Next.js / Convex API
  authenticates the user
  verifies ownership
  consumes rate limits before expensive work
  creates or updates media job records

Media worker service
  claims queued jobs
  downloads source objects from R2
  processes files with Mediabunny
  writes outputs and posters to R2
  saves final Convex records
  reports progress and failures

Cron / scheduled tasks
  requeue expired locks
  retry recoverable failures
  delete abandoned raw inputs
  expire old failed jobs
```

Cron jobs should not be the main processing engine. Cron is good for recovery and
cleanup. For responsive processing, create a job immediately and have a worker
claim it from a queue or from Convex with an atomic lock. If cron is used to kick
workers, it must still claim jobs idempotently.

### Browser-close Durability Boundary

Skipping multipart/resumable uploads leaves one intentional gap: a brand-new
local file upload is not browser-close safe until the browser finishes uploading
the raw file to R2 and the server creates the durable job record.

Durability starts at different points by workflow:

- New video/photo upload: durable after the raw source object exists in R2 and
  the `upload-normalization` job exists in Convex.
- Stitchr and Longr: durable immediately after the export job is created because
  the selected source clips are already saved R2 objects.
- Clipr and Swapr provider work: durable after the provider job and enough
  finalization metadata are saved server-side. The browser must not be required
  to download provider output, upload it to R2, or create the final library
  record.
- Export-time music mixing: durable only after it is represented as a server
  media job. Browser-local download rendering remains non-resumable until moved.

Until resumable uploads are added, the UI should treat the initial raw upload as
the only "keep this tab open" step. Once the upload completes and the job appears
in Convex, the user can close the browser and return later.

## Runtime Choice

Use a long-running worker in a container or VM. Avoid putting video encoding in
Vercel route handlers, Edge functions, or other request-time runtimes with short
timeouts and uncertain codec support.

Recommended ClipStitchr stack:

- Convex owns job records, ownership checks, realtime progress, retries, and
  final metadata writes.
- R2 owns raw inputs, normalized outputs, stitched outputs, posters, and cleanup
  candidates.
- Cloudflare Queues can dispatch work. Prefer a pull consumer when the media
  worker needs explicit control over concurrency and only wants to pull when CPU,
  memory, and scratch disk are available.
- Cloudflare Containers are the best Cloudflare-native candidate for Option A.
  The current published instance types go up to `standard-4` with 4 vCPU, 12 GiB
  memory, and 20 GB disk. The current Containers docs describe vCPU, memory, and
  disk, but do not document GPU media instances, so assume CPU encoding unless a
  production benchmark proves otherwise.

Do not use these as the primary video encoder:

- Plain Cloudflare Workers: Workers are good for auth, signed URLs, queue
  producers, and lightweight orchestration. They are a poor fit for video
  encoding because the isolate memory limit is 128 MB, queue consumers have a 15
  minute duration limit, and CPU-heavy media jobs can hit runtime limits.
- Convex Actions: use actions to orchestrate external work, schedule retries, or
  call a worker API. They are not the right place to run Mediabunny video
  rendering because actions time out after 10 minutes and the Node.js runtime has
  a 512 MB memory limit.
- Cloudflare Stream: useful for managed video upload, encoding, packaging, and
  playback, but it is not a replacement for ClipStitchr's custom frame-level
  workflows such as UGC-then-Demo stitching, shared text overlay rendering, trim
  ranges, and one-output-per-UGC batches.

There are two practical server-side paths.

### Option A: Native Mediabunny Worker

Run `mediabunny` in Node, Bun, or Deno using server-side IO:

- Download R2 objects to local scratch disk.
- Read with `FilePathSource`.
- Write with `FilePathTarget` for large files or `BufferTarget` for small files.
- Upload the completed output to R2.
- Delete local scratch files after finalization.

This is the cleanest architecture if the runtime can decode and encode the
needed codecs. The worker must run a startup self-test before accepting jobs.
Support checks prove that a codec path exists; they do not prove it is fast.

```ts
import {
  canEncodeAudio,
  canEncodeVideo,
  Mp4OutputFormat,
} from "mediabunny";
import { registerAacEncoder } from "@mediabunny/aac-encoder";

export async function assertMediaWorkerSupport() {
  if (!(await canEncodeAudio("aac"))) {
    registerAacEncoder();
  }

  const canEncodeAac = await canEncodeAudio("aac", {
    numberOfChannels: 2,
    sampleRate: 48_000,
    bitrate: 160_000,
  });
  const format = new Mp4OutputFormat();
  const supportsAvc = format.getSupportedVideoCodecs().includes("avc");
  const canEncodeAvc = await canEncodeVideo("avc", {
    width: 1080,
    height: 1920,
    bitrate: 8_000_000,
  });

  if (!supportsAvc || !canEncodeAvc || !canEncodeAac) {
    throw new Error("This worker cannot encode ClipStitchr MP4 output.");
  }
}
```

Each job must also validate the actual input tracks before doing expensive work:

```ts
import { ALL_FORMATS, FilePathSource, Input } from "mediabunny";

export async function assertInputCanDecode(inputPath: string) {
  const input = new Input({
    source: new FilePathSource(inputPath),
    formats: ALL_FORMATS,
  });

  try {
    const videoTrack = await input.getPrimaryVideoTrack();
    const audioTrack = await input.getPrimaryAudioTrack();

    if (!videoTrack || !(await videoTrack.canDecode())) {
      throw new Error("Worker cannot decode the input video track.");
    }

    if (audioTrack && !(await audioTrack.canDecode())) {
      throw new Error("Worker cannot decode the input audio track.");
    }
  } finally {
    input.dispose();
  }
}
```

Do not deploy a native worker until this self-test passes in the actual
production runtime.

### Production Benchmark Gate

The runtime is acceptable only after a benchmark passes in the production worker
image and instance type. Run the benchmark at deploy time or worker startup, and
store the result in logs/metrics.

Benchmark cases:

- Normalize a fixed 10-30 second UGC clip to 1080x1920 MP4.
- Stitch one normalized UGC clip plus one normalized Demo clip.
- Stitch the same pair with the shared text overlay path enabled.
- For Longr, render a longer sequence that is large enough to force the
  `FilePathTarget` path.

Metrics to record:

- Input duration seconds.
- Wall-clock processing seconds.
- Real-time factor: `inputDurationSeconds / wallClockSeconds`.
- Peak RSS memory.
- Scratch disk used.
- Output size.
- Whether AVC and AAC were native or custom-encoder backed.

Suggested acceptance bar for the first worker:

- Upload normalization should be at least real-time. Prefer 1.5x real-time or
  faster before removing the browser fallback.
- Short Stitchr exports should be close to current desktop-browser performance.
- Peak memory must stay below 70 percent of the selected container memory.
- Scratch disk must stay below 70 percent of the selected container disk.
- Any failed codec check or benchmark marks the worker unhealthy and prevents it
  from claiming jobs.

Start Cloudflare Containers testing on `standard-3` or `standard-4`. If the
codec checks pass but the benchmark is too slow, compare against Option B
server-hosted Chromium and against a dedicated media VM/container host with known
H.264 acceleration.

### Option B: Server-hosted Browser Worker

Run the current browser Mediabunny code inside a server-hosted Chromium worker.
This still moves processing off the user's device. It can preserve the fast
browser WebCodecs path more directly than a plain Node worker.

This is useful if native Node/Bun/Deno codec support is not sufficient. The trade
offs are operational complexity, higher memory use, browser process management,
and production codec validation in headless Chromium.

Use this as a compatibility bridge, not as a reason to keep job state in the
browser. The API contract should still be durable jobs plus R2 inputs and
outputs.

## Mediabunny IO Mapping

Current browser code uses `BlobSource` and `BufferTarget`:

```ts
new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });
```

Server workers should usually use local files:

```ts
import {
  ALL_FORMATS,
  FilePathSource,
  FilePathTarget,
  Input,
  Mp4OutputFormat,
  Output,
} from "mediabunny";

const input = new Input({
  source: new FilePathSource("/tmp/clipstitchr/input.mp4"),
  formats: ALL_FORMATS,
});

const output = new Output({
  format: new Mp4OutputFormat({ fastStart: false }),
  target: new FilePathTarget("/tmp/clipstitchr/output.mp4"),
});
```

Use `BufferTarget` only for known small outputs. Mediabunny's docs describe it as
a good fit for small-ish files, but it keeps the output in memory. Use
`FilePathTarget` or `StreamTarget` for Longr, large Stitchr batches, and anything
that can exceed roughly 100 MB.

For MP4 `fastStart`:

- `false` is fastest and uses the least memory. R2 signed downloads can still
  work because object storage supports range requests, but playback may wait
  longer before metadata is read.
- `"in-memory"` gives web-friendly fast-start MP4s but stores media chunks in
  memory until finalization.
- `"fragmented"` can stream append-only output with lower memory, but fragmented
  MP4 compatibility and seek behavior need product testing.

Default recommendation:

- Use `fastStart: "in-memory"` for short Stitchr outputs under a measured memory
  threshold.
- Use `fastStart: false` for large Longr outputs unless web playback startup is
  unacceptable.
- Benchmark `"fragmented"` separately before using it for user-facing saved MP4s.

## Job Data Model

Add a `mediaJobs` table or separate typed job tables. A single table is probably
enough at first.

Required fields:

- `id`
- `ownerId`
- `type`
- `status`: `queued`, `running`, `succeeded`, `failed`, `canceled`
- `stage`
- `progress`
- `attempt`
- `lockedBy`
- `lockedUntil`
- `inputObjects`
- `outputObjects`
- `sourceClipIds`
- `sourcePhotoIds`
- `trimRanges`
- `textOverlay`
- `music`
- `finalRecordIds`
- `error`
- `createdAt`
- `updatedAt`
- `startedAt`
- `completedAt`

The job record must contain enough metadata to finish without the original
browser tab. The UI should render progress from Convex and never be the only
place that knows how a job should finish.

## Fully Server-side Workflow Plan

### Upload Normalization

1. Browser asks for a raw upload signed URL.
2. Server checks auth, ownership, file size limits, and R2 upload limits.
3. Browser uploads the original video to R2.
4. Browser creates an `upload-normalization` job with raw object reference,
   target clip type, original filename, and desired `contain` or `cover` fit.
5. Worker downloads the raw object to scratch disk.
6. Worker creates a `FilePathSource` input.
7. Worker uses `Conversion` for one-input, one-output normalization.
8. Worker writes a 1080x1920 MP4 with AVC video and AAC audio when supported.
9. Worker captures a poster from the normalized output.
10. Worker uploads normalized video and poster to R2.
11. Worker saves the `videoClips` Convex record.
12. Worker marks the job complete and schedules raw object cleanup.

This replaces browser `normalizeUploadedVideo`.

### Stitchr

1. Browser creates a `stitchr-export` job with selected UGC clip IDs, demo clip
   ID, copied trim ranges, and one shared text overlay.
2. Server checks batch caps and consumes the media-processing limits before the
   job enters the queue.
3. Worker downloads the normalized UGC and demo objects.
4. For each selected UGC, worker creates one output.
5. Worker reads both inputs with `Input` plus media sinks.
6. Worker writes samples to a fresh `Output` with `VideoSampleSource` or
   `CanvasSource` and `AudioSampleSource`.
7. UGC samples start at `0`; Demo samples start after the trimmed UGC duration.
8. Worker applies the text overlay with `OffscreenCanvas` and returns frames
   through `CanvasSource` or `VideoSampleSource` processing.
9. Worker awaits every source `add(...)` call to preserve backpressure.
10. Worker interleaves audio and video work enough to avoid holding an entire
    video stream in packet buffers while waiting for audio.
11. Worker uploads each finished stitch and poster to R2.
12. Worker saves one `stitches` record per UGC output.

This replaces browser `stitchNormalizedVideos` and
`stitchNormalizedVideosWithTextOverlay`.

### Longr

1. Browser creates a `longr-export` job with ordered clip IDs and trim ranges.
2. Worker downloads normalized source clips.
3. Worker writes one 9:16 output by retimestamping samples in order.
4. Worker uploads the output and poster to R2.
5. Worker saves the `longrVideos` record.

Use `FilePathTarget`, not `BufferTarget`, for the default Longr path because
Longr can be much larger than a single Stitchr output.

### Clipr Final Video And Music Export

Move provider finalization first:

1. Replicate webhook or recovery finalizer copies avatar video and music outputs
   into R2.
2. If generated provider video needs normalization, create a media job.
3. Worker normalizes the generated video, captures a poster, and saves the final
   Clipr `videoClips` record.
4. Optional music stays as a separate R2 object unless the user requests a mixed
   export.
5. A `clipr-music-export` job can create a server-side mixed MP4 when the user
   wants a persisted music mix.

This replaces browser `renderCliprVideoWithMusic` when export/download must be
recoverable.

### Swapr Output Post-processing

1. Swapr provider job completes.
2. Webhook stores the provider output URL and creates a media post-processing
   job.
3. Worker downloads the provider output promptly.
4. Worker normalizes to 1080x1920, captures poster, uploads to R2, and saves a
   `videoClips` record with Swapr metadata.

This removes the fragile browser handoff after provider completion.

### Swipr Static Exports

Swipr is image generation and canvas rendering rather than Mediabunny video
processing. To make it fully server-side, add a worker path that renders each
slide in a server-compatible canvas/image runtime, uploads PNG outputs or a ZIP
to R2, and saves a durable export job.

## Rate Limits And Abuse Protection

Moving media processing server-side creates a new cost surface: CPU, memory,
disk, R2 bandwidth, and possibly GPU time. Add limits before enabling workers:

- Job create per user.
- Estimated input bytes per day and month.
- Estimated output seconds per hour, day, and month.
- Concurrent running jobs per user.
- Global running jobs per worker pool.
- R2 raw upload signed URL limits.
- R2 output byte limits.
- Retry attempt caps.
- Admin-only or internal-only job recovery endpoints.

Update `docs/backend/rate-limits.md` when concrete limits are chosen. A media job
must be rejected before raw upload URLs or worker dispatch if limits are already
exceeded.

## Speed Rules

To keep server processing close to the current browser speed:

1. Keep the same normalized target: 1080x1920, AVC video, AAC audio, 8 Mbps video
   bitrate, 160 kbps audio bitrate unless benchmarks say otherwise.
2. Use a long-running worker pool so codec setup and package loading are not
   paid on every request.
3. Use local scratch disk for inputs and outputs. Avoid repeatedly reading R2
   ranges during decode unless benchmarks prove `UrlSource` is faster.
4. Limit job concurrency to actual CPU/GPU capacity. More parallel encodes can
   make every job slower.
5. Keep batch stitching one output per UGC, but run only a small number of UGC
   outputs concurrently per user.
6. Await Mediabunny backpressure promises from `add(...)`.
7. Use `FilePathTarget` for large outputs to avoid memory pressure.
8. Register the AAC encoder once per worker process when needed.
9. Run a production startup self-test for codec encode/decode support.
10. Benchmark Native Worker versus Server-hosted Browser Worker before committing
    to one runtime.

## Option A Implementation Plan

### Phase 0: Define Contracts And Feature Flags

- Add a `server-media-processing` feature flag that can be enabled per workflow:
  upload normalization, Stitchr, Longr, Clipr finalization, Swapr finalization,
  and persisted music export.
- Keep the existing browser rendering paths behind fallback flags until the
  worker passes production benchmarks and output parity checks.
- Define the worker API boundary as job IDs plus R2 object references, not raw
  browser `Blob` values.
- Define worker secrets separately from `RATE_LIMIT_API_SECRET`; the media worker
  needs a server-only credential for Convex worker mutations and R2 access.
- Document local development prerequisites: R2-compatible bucket, Convex dev
  deployment, sample fixture clips, and a way to run the worker container.

Exit criteria: every workflow has a named feature flag, a server-owned job
contract, and a fallback decision.

### Phase 1: Prove Worker Runtime

- Create a small worker prototype outside the Next.js request path.
- Prefer `workers/media-worker/` or `services/media-worker/` so the worker is
  clearly separate from the Next.js app runtime.
- Package the worker as a container image that installs `mediabunny` and
  `@mediabunny/aac-encoder`.
- Download one R2 test video to local scratch.
- Normalize it with `Conversion`, `FilePathSource`, and `FilePathTarget`.
- Capture a poster.
- Upload outputs back to R2.
- Measure output correctness, duration, CPU, memory, and wall time.
- Run the codec startup self-test in the target production environment.
- Add a worker health check that fails when codec support or benchmark gates
  fail.

Exit criteria: one upload normalization job is faster than or close to browser
normalization on a typical user machine, and it survives browser refresh.

### Phase 2: Add Durable Media Jobs

- Add `mediaJobs` to the Convex schema with indexes for owner/status, status,
  lock expiration, and job ID.
- Add validators for job type, status, stage, source objects, output objects,
  trim ranges, text overlays, and final record IDs.
- Add user-facing mutations/routes for creating jobs:
  `upload-normalization`, `stitchr-export`, `longr-export`,
  `clipr-finalization`, `swapr-finalization`, and `clipr-music-export`.
- Add worker-only mutations:
  `claim`, `heartbeat`, `updateProgress`, `complete`, `fail`, `cancel`, and
  `releaseExpiredLock`.
- Add idempotency fields so retrying a completed job returns the existing final
  record IDs instead of creating duplicate assets.
- Add dashboard queries for active, failed, and recent completed jobs.
- Add job status UI that survives route changes and reloads.

Exit criteria: the browser can close after job creation and see the completed
asset on reload.

### Phase 3: Add Rate Limits And Queue Dispatch

- Extend `docs/backend/rate-limits.md` with server media limits before enabling
  worker dispatch.
- Add per-user job creation limits, output seconds limits, concurrent running job
  limits, raw upload byte limits, retry caps, and global worker-pool limits.
- Consume limits before issuing raw R2 upload URLs or creating queued jobs.
- Use Cloudflare Queues for dispatch when available. Queue messages should carry
  only the job ID and type; the worker must re-read and claim the job from
  Convex before work starts.
- Use a pull consumer or explicit worker polling if queue push delivery makes
  concurrency hard to control.
- Add a scheduled recovery task that requeues jobs whose `lockedUntil` has
  expired.

Exit criteria: queued jobs cannot exceed configured cost/concurrency caps, and
stale locks recover without manual database edits.

### Phase 4: Move Upload Normalization

- Upload originals to R2 first.
- Do not add multipart/resumable uploads in this phase. Initial raw upload can
  still be interrupted by browser close.
- Create the `upload-normalization` job only after the raw object upload
  succeeds.
- Process normalization in the worker.
- Generate posters in the worker after the normalized output is written.
- Save final `videoClips` records from the worker.
- Mark the job complete only after R2 output upload and Convex save both
  succeed.
- Add cleanup for abandoned raw upload objects after success, cancellation, or
  expiration.
- Keep browser fallback behind a feature flag until server output quality and
  speed are proven.

Exit criteria: after the raw upload completes, the user can close the browser and
later see the normalized clip in the library.

### Phase 5: Move Stitchr And Longr

- Add job creation routes or Convex mutations for Stitchr and Longr.
- Validate source clip ownership and clip availability before queueing.
- Copy trim ranges and text overlay settings into the job record at creation
  time so later metadata edits do not mutate an in-flight export.
- Move stitching and long-form composition to the worker using `FilePathSource`
  inputs and `FilePathTarget` outputs.
- Keep one-output-per-UGC semantics for Stitchr.
- Preserve UGC-then-Demo sequencing, trim ranges, shared text overlay, and poster
  generation.
- Save final `stitches` or `longrVideos` records from the worker.
- Keep the browser preview path; only final rendering moves to the worker.

Exit criteria: a user can start Stitchr or Longr, close the browser immediately
after the job is accepted, and later see saved outputs in the library.

### Phase 6: Move Provider Finalization And Export Mixes

- Finalize Swapr, avatar, and Clipr provider outputs from webhooks or recovery
  jobs, not browser polling callbacks.
- Store provider prediction IDs, model IDs, source asset IDs, output URLs, and
  finalization metadata before starting provider work when possible.
- Copy provider outputs to R2 promptly because provider-hosted outputs are not
  permanent.
- Create media post-processing jobs when provider output needs normalization,
  poster capture, stitching, or music mixing.
- Save final `videoClips` or `photoAssets` records from server finalizers and
  workers.
- Add optional server-side persisted music-mix exports where product behavior
  requires resumability.

Exit criteria: Clipr and Swapr can finish without the browser downloading
provider output, uploading to R2, or saving the final library record.

### Phase 7: Observability, Rollout, And Cleanup

- Add structured logs for job ID, owner ID hash, job type, stage, attempt,
  runtime, input seconds, output bytes, real-time factor, memory, and disk use.
- Add alerts for worker unhealthy, queue backlog, retry spikes, R2 failures,
  Convex mutation failures, and benchmark regressions.
- Add admin/recovery tooling for failed jobs that still have valid inputs.
- Add cleanup schedules for raw inputs, scratch objects, expired failed jobs, and
  orphaned partial outputs.
- Roll out one workflow at a time: upload normalization first, then Stitchr,
  Longr, Swapr, Clipr finalization, and persisted music exports.
- Remove browser rendering fallbacks only after production metrics show stable
  speed, correctness, and cost.

Exit criteria: server processing is observable, recoverable, and cheaper/faster
enough to make browser fallback unnecessary for the enabled workflow.

## Bottom Line

Mediabunny can be part of a fully server-side ClipStitchr pipeline, but the
server is ClipStitchr's responsibility. The fastest safe architecture is a
durable worker pool that uses Mediabunny directly, validates codec support at
startup, reads and writes through server-side sources and targets, and treats
cron as recovery infrastructure instead of the main media processor.
