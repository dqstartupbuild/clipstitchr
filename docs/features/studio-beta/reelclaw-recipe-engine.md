# Studio Stitch recipe engine

## Current capability

The Studio Stitch recipe engine is the pure, deterministic planning half of a
working execution feature. It turns Product-grounded inputs into versioned V1
plans for two ReelClaw-derived workflows:

- classic 7 to 15 second reaction, demo, and cutaway reels;
- talking 20 to 30 second testimonial-style reels with a seven-beat cadence.

Planning remains side-effect free. It calculates timing, grouped captions,
overlays, music, transitions, CTA placement, source continuity, provider
requirements, and a representative review subset. The separate worker then
parses the frozen recipe again and executes it. A recipe result is therefore a
plan, while a completed generation run is backed by verified media evidence.

## Planning and execution boundary

Public planning entry points are exported from
`web/lib/clipstitchr/studio/stitch/index.ts`. Recipe V1 contracts carry durable
source references and source-backed Product and Hook Lab claim provenance.
Strict parsing rejects unknown shapes, canonical serialization preserves stable
snapshots, and returned plans are deeply frozen.

The concrete execution boundary lives in
`web/services/studio-stitch-worker`. It accepts only a secret-authenticated,
leased `studio-stitch-claim-v1` envelope from the web coordinator. Convex
independently rechecks the global Studio switch, execution switch, Studio grant,
owner, active Product, run, recipe, lease, cancellation, and source scope. The
browser cannot mint generated output metadata or mark a run complete.

Provider requirements stay inside the recipe. Existing reaction or demo input
avoids unnecessary provider work. When a frozen recipe requires it, the worker
can use:

- DanSUGC B-roll search, purchase, purchase-history reconciliation, and bounded
  acquired-media download;
- Gemini resumable upload and grounded demo analysis;
- ElevenLabs talking voice plus word timings;
- local FFmpeg/ffprobe rendering and verification with `file,pipe` as the media
  protocol allowlist.

Every provider and render operation receives a durable owner/Product/run/recipe
cost reservation before the side effect. DanSUGC selection is checkpointed
before purchase. A lost purchase response is reconciled against purchase
history; a repeated purchase reservation performs reconciliation only and can
never send a second purchase request. Unresolved coverage becomes an uncertain,
non-automatic-retry failure.

## Source and version

The supplied ReelClaw source is preserved literally at
`web/vendor/reelclaw/snapshot_bdeb17ca/upstream`. It contains 14 files and has
the deterministic source fingerprint
`bdeb17cac41fd8040a39a32f660f336c1a6e5d608125efb1043b924ab9f4f426`.
The ClipStitchr recipe contract is V1 and the worker coordinator contract is
`studio-stitch-claim-v1`.

Verify the source snapshot with:

```bash
cd web
npm run reelclaw:verify-vendor
```

## Security, storage, and limits

The engine itself performs no network, storage, provider, or render work. The
execution boundary streams R2 and provider bodies through byte caps, uses fixed
provider hosts and request deadlines, rejects redirects, isolates child-process
environment and temporary directories, and cleans workspaces after success,
failure, or cancellation. Durable outputs include immutable R2 version,
SHA-256, size, duration, dimensions, audio facts, and codec facts.

Verified execution caps are 128 KiB per checkpoint, 2 GiB per input, 512 MiB
per reaction or rendered output, 4 GiB per temporary workspace, 32 MiB per
provider response, 512 KiB per coordinator response, and 1 MiB per child-command
output. Leases are 30 to 900 seconds; coordinator requests are 1 to 120 seconds.

Execution requires exact `STUDIO_BETA_ENABLED=true`, exact
`STUDIO_STITCH_EXECUTION_ENABLED=true`, a distinct worker secret of at least 32
characters, the coordinator origin, and R2 credentials. DanSUGC, Gemini, and
ElevenLabs are optional globally but fail honestly when a selected recipe needs
one that is not configured. The full environment contract is in
`web/.env.example` and the worker README.

## Rate gates

Worker claims allow 3,600/hour per worker with burst 120. Worker lifecycle
writes allow 1,200/hour per owner and 30,000/hour globally, with bursts 180 and
3,000. Paid intent gates are:

| Operation | Owner/hour | Global/hour | Burst owner/global |
| --- | ---: | ---: | ---: |
| DanSUGC | 30 | 1,000 | 5 / 100 |
| Gemini | 60 | 2,000 | 10 / 200 |
| ElevenLabs | 60 | 2,000 | 10 / 200 |
| Render | 120 | 4,000 | 20 / 400 |

Studio Stitch record writes allow 300/hour per owner and 10,000/hour globally,
with bursts 60 and 1,500. Static reads allow 600/hour per owner and 20,000/hour
globally, with bursts 120 and 3,000. Authorization remains independent of every
rate gate.

## Accepted output handoffs

An authenticated user materializes an output through
`POST /api/studio/stitch/outputs/:outputId/materialize` with
`{productId,idempotencyKey}`. The route reserves static-read quota before its R2
HEAD, then verifies owner namespace, immutable version, SHA-256, size, content
type, and worker-probed media facts. One atomic mutation creates the active
Product Library video clip, marks the output accepted, and stores durable editor
`studioOutput` and publishing `studio-stitch-output` identities. No signed URL is
stored as a handoff identity.

## File tree

- `web/lib/clipstitchr/studio/stitch`: pure planners, parsing, serialization,
  timing, captions, and review-subset selection
- `web/lib/clipstitchr/types/studioStitch`: public V1 recipe and
  materialization contracts
- `web/services/studio-stitch-worker`: fixed-host provider adapters, R2, media
  probing, rendering, runtime, validation, workspace lifecycle, Docker image,
  and deployment README
- `web/app/api/studio/stitch/worker`: secret-authenticated coordinator routes
- `web/convex/studioReelWorker`: atomic claims, leases, checkpoints, progress,
  reservations, completion, and failure
- `web/app/api/studio/stitch/outputs/[outputId]/materialize`: authenticated
  output materialization gateway
- `web/vendor/reelclaw/snapshot_bdeb17ca`: literal source, provenance,
  deterministic manifest, and verifier

## Tests and runtime proof

Planner tests cover classic and talking durations, beat order, caption sizing,
claim provenance, provider requirements, representative review selection,
validation, serialization, and deep immutability. The execution suite covers
strict auth, weak-secret rejection, owner/Product revocation, leases,
cancellation, cost provenance, uncertain purchase recovery, streamed caps,
fatal UTF-8, R2 proof, media protocol restrictions, checkpoint recovery,
workspace cleanup, materialization, and the Dockerfile contract.

Run:

```bash
cd web
npx vitest run lib/clipstitchr/studio/stitch \
  services/studio-stitch-worker \
  app/api/studio/stitch/worker \
  app/api/studio/stitch/outputs \
  convex/studioReelWorker \
  convex/studioReelOutputs/materialize.test.ts \
  lib/clipstitchr/server/studio/stitch
```

The focused execution verification passes 38 files and 73 tests. The final
Cloud Run-compatible `linux/amd64` image ID is
`sha256:f31ac160edf9118ef4504495d1ab82608efe58ef057afc1956a41756594d109f`.
Its in-container credential-free `--check` returned local FFmpeg and ffprobe
available while execution and providers remained disabled without secrets. No
production deployment was performed.

## Boundaries

The planning library deliberately remains pure; provider calls and rendering
never run inside it. Only frozen V1 recipes are executable. Classic Stitchr is
unchanged. Provider-dependent recipes do not receive fake media when readiness
is missing, and an unresolved paid-provider outcome is not reported as success.
