# Studio Stitch execution

## What is implemented

Studio Stitch has a concrete server-side execution boundary for the pure,
deterministic classic and talking recipe engine. A Cloud Run Job-compatible
worker claims a Product-scoped run atomically, validates every frozen V1 recipe,
executes only owner-scoped durable media, saves bounded progress checkpoints,
and completes only after every expected MP4 has an immutable R2 and media proof.

The run retains its existing `intentReady` status during execution. Lease,
checkpoint, progress, cancellation, failure, and completion fields describe the
worker lifecycle without inventing a browser-controlled completion state.

## Trust and coordinator contract

The worker uses contract `studio-stitch-claim-v1` and the exact header
`x-studio-stitch-worker-secret` on these POST endpoints:

- `/api/studio/stitch/worker/claim`
- `/api/studio/stitch/worker/lease-state`
- `/api/studio/stitch/worker/progress`
- `/api/studio/stitch/worker/checkpoints/save`
- `/api/studio/stitch/worker/checkpoints/get`
- `/api/studio/stitch/worker/cost-reservations`
- `/api/studio/stitch/worker/complete`
- `/api/studio/stitch/worker/fail`

The Next coordinator and Convex reject missing, weak, prefix-only, suffix-only,
or unequal secrets. Each Convex operation separately rechecks the global Studio
switch, execution switch, Studio grant, owner, active Product, run, recipe,
lease, and cancellation state. Frozen recipe snapshots are parsed instead of
trusted. `recordGenerated`, `markCompleted`, and `markFailed` are internal-only,
so browsers cannot mint R2 metadata or complete a run.

Authenticated Studio Stitch browser and worker JSON responses, including every
success and error path, are explicitly `private, no-store`; user GET routes are
also forced dynamic. Worker and browser error boundaries expose fixed public
messages and redact URLs, object keys, authorization values, and token-like
material before durable or public use.

## Execution pipeline

1. Atomically claim an eligible `intentReady` run with a recoverable lease.
2. Parse the frozen V1 recipe and owned source manifests.
3. Stream R2 inputs into a private workspace, verify SHA-256 and version, and
   probe media facts with ffprobe.
4. Acquire only provider work required by that recipe.
5. Render segments, transitions, cutaways, music, captions, overlays, and
   talking voice with FFmpeg.
6. Probe the final MP4 and reject duration, dimension, codec, or audio mismatch.
7. Upload to the owner/Product output namespace, verify R2 HEAD facts, save a
   durable checkpoint, and complete only with exact recipe/output coverage.

Cancellation and claim validity are observed before every provider, render, and
upload side effect. Expired leases can be reclaimed; stale workers cannot write
progress or completion. Resume reads the highest validated checkpoint and skips
already durable outputs.

## Provider boundaries

- DanSUGC uses the fixed `https://dansugc.com/api/v1/broll`, purchase, and
  purchase-history contract. Download URLs must be HTTPS and match an exact
  configured host allowlist. Deterministic selection is checkpointed before
  purchase. A lost purchase response is reconciled; a repeated reservation can
  only list/reconcile and never POST a second purchase. Missing coverage is
  classified uncertain.
- Gemini uses fixed `generativelanguage.googleapis.com` endpoints, resumable
  upload, bounded response reads, redirects disabled, and deadlines. It runs
  only when the frozen recipe needs demo intelligence not satisfied by input.
- ElevenLabs uses fixed `api.elevenlabs.io`, bounded JSON/audio, a deadline, and
  returned word timings. It runs only for a talking recipe requiring provider
  voice.
- FFmpeg and ffprobe run with `shell:false`, workspace-scoped HOME/cache/temp,
  no inherited provider or worker secrets, deadlines, bounded output, and the
  `file,pipe` input protocol allowlist.

Every DanSUGC, Gemini, ElevenLabs, and render side effect has a durable
owner/Product/run/attempt/recipe/invocation reservation. Existing non-idempotent
Gemini or ElevenLabs reservations without a durable result return uncertain
instead of replaying. DanSUGC search and acquired-media download remain
replay-safe; purchase follows the stricter reconciliation rule above.

## Durable output and materialization

Completion verifies exact recipe count and identity plus object key, immutable
object version, lowercase SHA-256, byte size, duration, 1080 by 1920 dimensions,
audio presence, and codec facts. It never accepts a signed URL as durable proof.

Accepted outputs use:

```text
POST /api/studio/stitch/outputs/:outputId/materialize
{ "productId": "...", "idempotencyKey": "..." }
```

The route rechecks the authenticated owner, Studio grant, active Product, output
scope, R2 owner namespace, immutable version, SHA-256, size, content type, and
worker-probed media facts. It then atomically creates one Product Library video
clip and stores three durable identities:

- Library: `{kind:"videoClip", id}`
- editor: `{kind:"studioOutput", outputId}`
- Postiz Beta: `{kind:"studio-stitch-output", sourceId}`

Idempotent replay returns the same identities without duplicating storage or
provider work.

## Configuration and verified limits

Execution requires exact `STUDIO_BETA_ENABLED=true` and exact
`STUDIO_STITCH_EXECUTION_ENABLED=true`. It also requires
`STUDIO_STITCH_WORKER_SECRET` with at least 32 characters,
`STUDIO_STITCH_WORKER_API_ORIGIN`, and R2 account, bucket, access-key, and secret
values. The distinct Studio Stitch secret must not reuse Clips, provider, or
media worker credentials.

Optional provider variables are `DANSUGC_API_KEY` plus the exact-host
`STUDIO_STITCH_DANSUGC_DOWNLOAD_HOSTS`, `GEMINI_API_KEY`, and
`ELEVENLABS_API_KEY`. Worker ID, lease, poll, HTTP deadline, scratch root,
FFmpeg/ffprobe path, and font path settings are listed in `web/.env.example`.
Missing optional configuration disables only recipes that require it.

Verified byte caps are:

| Boundary | Cap |
| --- | ---: |
| Checkpoint snapshot | 128 KiB |
| Coordinator response | 512 KiB |
| Provider response | 32 MiB |
| Input object | 2 GiB |
| Reaction object | 512 MiB |
| Rendered output | 512 MiB |
| Temporary workspace | 4 GiB |
| Child command output | 1 MiB |

Worker lease configuration is 30 to 900 seconds. Polling is 250 milliseconds
to 60 seconds. Coordinator request timeout is 1 to 120 seconds. Provider- and
render-specific calls also carry bounded deadlines.

## Rate limits

| Boundary | Owner | Global | Burst owner/global |
| --- | ---: | ---: | ---: |
| Record write | 300/hour | 10,000/hour | 60 / 1,500 |
| Static read | 600/hour | 20,000/hour | 120 / 3,000 |
| Worker lifecycle write | 1,200/hour | 30,000/hour | 180 / 3,000 |
| Worker claim | 3,600/hour per worker | n/a | 120 / n/a |
| DanSUGC intent | 30/hour | 1,000/hour | 5 / 100 |
| Gemini intent | 60/hour | 2,000/hour | 10 / 200 |
| ElevenLabs intent | 60/hour | 2,000/hour | 10 / 200 |
| Render intent | 120/hour | 4,000/hour | 20 / 400 |

Materialization reserves static-read quota before R2 HEAD, then consumes record
write and existing Library save limits only after proof validation. Rate limits
never replace authorization or Product ownership checks.

## Source, files, and deployment shape

The pure recipes are grounded in the literal 14-file ReelClaw snapshot at
`web/vendor/reelclaw/snapshot_bdeb17ca/upstream`, fingerprint
`bdeb17cac41fd8040a39a32f660f336c1a6e5d608125efb1043b924ab9f4f426`.
The worker uses the supplied TikTok Sans asset from the pinned SupoClip vendor
snapshot for ASS caption rendering.

Key paths are:

- `web/services/studio-stitch-worker`: runtime, providers, R2, ffprobe/FFmpeg,
  validation, Dockerfile, and production Job instructions
- `web/app/api/studio/stitch/worker`: coordinator routes and safe error boundary
- `web/convex/studioReelWorker`: leases, scope checks, checkpoints, reservations,
  progress, complete, and fail
- `web/lib/clipstitchr/types/studioStitchWorker`: serializable worker DTOs
- `web/app/api/studio/stitch/outputs/[outputId]/materialize`: accepted-output
  Library/editor/publishing handoff

Production is documented as a scheduled Cloud Run Job using `--once`, not a
request-serving service. Cloud Run automatic retries are disabled so an
uncertain paid-provider outcome returns to durable reconciliation. Exact build,
push, deploy, Secret Manager, scheduler, and smoke commands are in
`web/services/studio-stitch-worker/README.md`. They are reference commands only;
no deployment was performed.

## Verification

The focused suite passes 38 files and 73 tests. It covers secret auth,
weak-secret failure, Product and access revocation, lease expiry, idempotency,
cancellation before side effects, owner/global cost provenance, bounded streamed
reads, missing and lying Content-Length, malformed UTF-8, provider host/deadline
rules, uncertain DanSUGC reconciliation, no duplicate purchase on resume, R2
namespace/checksum/version, local-only media protocols, isolated child env,
workspace cleanup and cap, checkpoint recovery, missing providers,
materialization, and Dockerfile contents.

Verification commands:

```bash
cd web
npx vitest run services/studio-stitch-worker \
  app/api/studio/stitch/worker \
  app/api/studio/stitch/outputs \
  convex/studioReelWorker \
  convex/studioReelOutputs/materialize.test.ts \
  lib/clipstitchr/server/studio/stitch
npm run typecheck
npm run lint
docker build --provenance=false --platform linux/amd64 \
  -f services/studio-stitch-worker/Dockerfile \
  -t clipstitchr-studio-stitch-worker:local .
docker run --rm --platform linux/amd64 \
  clipstitchr-studio-stitch-worker:local --check
```

The final current-lock `linux/amd64` image ID is
`sha256:f31ac160edf9118ef4504495d1ab82608efe58ef057afc1956a41756594d109f`.
The reproducible local build disables only BuildKit's optional provenance
attestation; its runtime layers are unchanged. The in-container check returned
`commandsAvailable:true`,
`providers.render:true`, `enabled:false`, and `ready:false`, exactly matching a
credential-free environment. `--check` made no network request, probed local
FFmpeg and ffprobe, and would fail if either command were missing. Test sources
are removed from the production image. Provider tests use fakes only.

## Honest boundaries

Only V1 classic and talking recipes are executed. Missing provider readiness
fails the affected recipe; it never fabricates a render. All final claims are
based on R2, checksum, ffprobe, and recipe evidence. The image was built and
checked locally for `linux/amd64`, but it was not pushed or deployed.
