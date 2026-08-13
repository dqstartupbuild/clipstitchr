# Studio Clips worker core and render revisions

## Purpose

Studio Clips turns an owned Product's long video into durable short clips and
then creates immutable render revisions without overwriting a prior output. The
same worker handles initial generation and revision jobs. It is a separate
Cloud Run workload, not a Vercel or Convex media process.

The worker contract is `studio-clips-claim-v2`. Its discriminator is either
`initial` or `render_revision`. Both modes use the same authorization, Product
ownership, lease, cancellation, cost-reservation, checkpoint, R2 integrity,
and completion boundaries.

## Durable model

An initial task freezes its source and output options. A render revision freezes
the exact source-output revision, object key, SHA-256, byte count, media facts,
caption timing, clean-caption-master identity, ordered merge inputs, and render
operation. Existing outputs are never changed in place.

The persisted records are:

- `studioClipsTasks`: initial request, lifecycle, lease, checkpoint, analysis
- `studioClipsOutputs`: immutable media identity, ffprobe facts, lineage, caption state
- `studioClipsRenderRevisions`: frozen operation and source snapshots, lifecycle, output IDs
- `studioClipsProductStyles`: the latest Product-wide caption default
- `studioClipsTaskEvents`: bounded worker progress and failure events

Only one queued or processing initial task or render revision may exist for one
owner and Product. Convex enforces this across both record kinds on create and
resume. Task summaries expose `activeRenderRevision`; task details also expose
newest-first bounded `renderRevisions`, so a client can recover active work and
history after refresh.

## HTTP contract

All user routes require Clerk authentication, Studio access, and an active
owned Product. Authenticated GET handlers are explicitly force-dynamic, and
every authenticated user or worker JSON success and error response carries
`Cache-Control: private, no-store`. JSON bodies are streamed through
route-specific byte limits, reject oversized declared lengths before reading,
cancel on actual overflow, and fatal-decode UTF-8. Signed download URL responses
remain private and non-cacheable; the object download keeps its own R2 policy.

### Create a render revision

`POST /api/studio/clips/render-revisions`

```json
{
  "schemaVersion": "studio-clips-render-revision-request-v1",
  "idempotencyKey": "client-generated-stable-key",
  "productId": "product-id",
  "taskId": "task-id",
  "sourceOutputId": "output-id",
  "sourceOutputRevision": 1,
  "operation": { "kind": "trim", "startSeconds": 2, "endSeconds": 18 }
}
```

Supported operations are:

- `trim`: inclusive source start and exclusive end in seconds
- `split`: one to 100 ordered split points, producing one immutable output per range
- `merge`: two to 20 unique output IDs in the exact requested order
- `captions`: enable/burn-in state plus optional saved style and language
- `regenerate`: deterministic clean rerender when `instructions` is absent
- `platform_export`: preset `tiktok`, `instagram_reels`, or `youtube_shorts`

`project_style` is a worker operation used by the Product-style endpoint, not a
direct output route operation. Free-text regeneration remains explicitly
unavailable because it requires an edit-planning provider that is not configured.

The response is `{created, renderRevision}`. An idempotent replay returns the
same revision with `created:false`. A reused idempotency key with a different
request is rejected.

### Read and control a revision

- `GET /api/studio/clips/render-revisions/{revisionId}?productId=...`
- `POST /api/studio/clips/render-revisions/{revisionId}/cancel`
- `POST /api/studio/clips/render-revisions/{revisionId}/resume`

Cancel and resume bodies are `{productId,idempotencyKey}`. Cancellation is
cooperative and checked before every cost stage. Resume creates a new attempt
from the last integrity-checked checkpoint; terminal completion is idempotent.
New outputs appear in the parent task's normal output list and use the existing
download, acceptance, Library, editor, Studio Stitch, and publishing handoffs.

### Save Product style

`PUT /api/studio/clips/product-style`

The versioned body contains `{schemaVersion,idempotencyKey,productId,style}`.
It saves the default for later initial jobs. When current outputs exist and no
other Product work is active, the response may also contain a `renderRevision`
that applies the style to a bounded output batch. Saving the default succeeds
without pretending a batch was queued when active work prevents it.

## Execution order

For both claim modes, the runtime performs these checks in order:

1. Validate the bounded v2 claim and exact owner/Product-scoped R2 keys.
2. Recheck Studio access, active Product ownership, attempt, and lease.
3. Check cancellation.
4. Reserve owner and global cost capacity immediately before each costly stage.
5. Acquire only fixed-host YouTube media or exact frozen R2 objects.
6. Probe media with ffprobe and validate the source-required audio contract.
7. Run the requested provider or FFmpeg stage.
8. Save a digest-checked R2 checkpoint and renew the lease during long work.
9. Probe every rendered output, upload with canonical base64 SHA-256, and verify
   checksum, bytes, MIME, and ETag with R2 `HeadObject`.
10. Complete only while the same attempt and lease remain valid.

FFmpeg and ffprobe receive only local workspace paths and a protocol allowlist
of `file,pipe`; network protocols cannot be opened from crafted media metadata.
Child processes receive a minimal non-secret environment, not `process.env`.
The worker's temporary workspace is mode 0700 and is removed after success,
cancellation, or failure.

## Real render behavior

- Trim and split re-encode selected ranges into H.264 MP4 and preserve optional audio safely.
- Ordered merge uses the frozen same-task output order. All inputs must either have audio or be silent; mixed-audio merges return a permanent unsupported-media result.
- Caption restyles use saved cue timing and a clean master. The seven templates,
  21 bundled fonts, font size, and hex color are strictly validated.
- Custom TTF/OTF fonts must be below 10 MiB and under the exact
  `users/{encoded-owner}/studio/v1/font/{productId}/` prefix. R2 metadata,
  ETag, SFNT magic, name-table bounds, and internal family name are checked
  before libass receives a workspace font directory.
- Deterministic regeneration performs a fresh encode. Free-text directions fail
  with `REGENERATION_PROVIDER_UNAVAILABLE` before pretending provider work occurred.
- Product-wide style creates real captioned outputs from clean masters and keeps
  the Product default for later tasks.

Platform presets are based on the supplied SupoClip `clip_editor.py` export
contract and are tested explicitly:

| Preset | Canvas | FPS | Video | Max rate / buffer | Audio | Max duration |
| --- | --- | ---: | --- | --- | --- | ---: |
| TikTok | 1080x1920 padded 9:16 | 30 | H.264 High, CRF 18, yuv420p | 10M / 20M | AAC 192k, 48 kHz | 180 s |
| Instagram Reels | 1080x1920 padded 9:16 | 30 | H.264 High, CRF 18, yuv420p | 12M / 24M | AAC 192k, 48 kHz | 180 s |
| YouTube Shorts | 1080x1920 padded 9:16 | 30 | H.264 High, CRF 18, yuv420p | 10M / 20M | AAC 192k, 48 kHz | 180 s |

Silent validated revision outputs use optional audio mapping and `-an`; initial
source videos still require spoken audio before transcription spend.

## Security and rate limits

The worker fails closed unless both `STUDIO_BETA_ENABLED` and
`STUDIO_CLIPS_WORKER_QUEUE_ENABLED` are the exact raw string `true`. The worker
secret must be at least 32 bytes. Next.js compares equal-length values with
`timingSafeEqual`; Convex uses a length-padded constant-work comparison and
rechecks the same minimum.

User-readable errors come from an authored allowlist. Filesystem paths, URLs,
IP/host details, structured dependency errors, provider bodies, credentials,
and stack details fall back to a generic message.

Render-revision creation is limited to 48 per owner per hour with burst 8 and
2,000 global per hour with burst 200. Each download/transcription/analysis/
B-roll/render stage also consumes the Studio Clips paid-stage owner/global
pair. Claims, worker lifecycle writes, static reads, task creation, and record
writes retain their independent limits. See
`docs/operations/security/rate-limits.md` for the authoritative table.

## File map

- `web/lib/clipstitchr/types/studioClips`: stable HTTP and persisted DTOs
- `web/app/api/studio/clips`: authenticated user and worker routes
- `web/convex/studioClipsTasks`: initial task persistence and cross-kind guard
- `web/convex/studioClipsRenderRevisions`: immutable revision lifecycle
- `web/convex/studioClipsProductStyles`: Product default and batch intent
- `web/convex/studioClipsWorker`: claim, lease, checkpoint, progress, fail, complete
- `web/services/studio-clips-worker/contracts`: strict worker v2 contracts
- `web/services/studio-clips-worker/adapters`: HTTP, provider, R2, source, probe, render
- `web/services/studio-clips-worker/runtime`: one-claim and continuous-loop orchestration
- `web/services/studio-clips-worker/validation`: bounded claim/checkpoint/output validation

Each implementation helper is split by purpose. Framework-required route
method pairs and local test fixtures are the only intentional multi-export files.

## Verification

From `web/`:

```bash
npx vitest run services/studio-clips-worker app/api/studio/clips \
  convex/studioClipsTasks convex/studioClipsOutputs \
  convex/studioClipsRenderRevisions convex/studioClipsProductStyles \
  convex/studioClipsWorker convex/studioClipsRateLimits
npx eslint services/studio-clips-worker app/api/studio/clips \
  convex/studioClipsTasks convex/studioClipsOutputs \
  convex/studioClipsRenderRevisions convex/studioClipsProductStyles \
  convex/studioClipsWorker convex/studioClipsRateLimits
npm run typecheck
./node_modules/.bin/tsx services/studio-clips-worker/runStudioClipsWorker.ts --check
docker build --platform linux/amd64 \
  -f services/studio-clips-worker/Dockerfile \
  -t studio-clips-worker:phase4-amd64 .
docker run --rm --platform linux/amd64 \
  studio-clips-worker:phase4-amd64 --check
```

`--check` is offline and credential-free. It validates the v2 contract and
reports configured/unavailable state without claiming work.

## True limitations

- Face-tracked vertical pan and split-screen composition from SupoClip are not exposed.
- SupoClip emoji/highlight animation, transition assets, silence/filler cleanup,
  source-map-aware noncontiguous editing, and transition insertion are not ported.
- Free-text regeneration needs a future edit-planning provider.
- The job and coordinator configuration have not been deployed or production-smoked.
