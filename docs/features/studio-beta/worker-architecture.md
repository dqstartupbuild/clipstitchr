# Studio Beta worker architecture

## Purpose

Studio Beta keeps long-running media and provider work outside Vercel request
execution. Next.js authenticates the user-facing request, Convex owns the job
ledger and leases, R2 owns immutable media, and a narrowly scoped runtime does
the expensive work. The existing classic ClipStitchr provider and media workers
are unchanged.

There are three isolated runtimes:

| Runtime | Work | Durable state |
| --- | --- | --- |
| Studio Clips Cloud Run Job | Long-video acquisition, transcription, analysis, B-roll, initial clips, render revisions, and platform exports | Convex task/revision/checkpoint/event records plus immutable R2 objects |
| Studio Stitch Cloud Run Job | Classic and talking recipe execution, provider acquisition, voice, captions, compositing, and output proof | Convex run/checkpoint/event/cost/output records plus immutable R2 objects |
| Studio publishing service | OAuth, scheduled dispatch, provider retries/reconciliation, media grants, and analytics sync | PostgreSQL outbox/post/attempt/receipt records plus Redis ephemeral state and owned R2 media |

LazyReel research is bounded, deterministic Next.js work against the vendored
corpus. The browser editor uses Media Bunny locally. Neither needs a media
worker for its currently supported path.

## Shared job boundary

The two media jobs use the same control pattern without sharing a generic job
document:

1. A Clerk-authenticated route independently checks the exact Studio switch,
   live beta grant, owner opt-in, and active Product ownership.
2. Convex validates the versioned request, reserves owner and global capacity,
   stores an idempotent intent, and enforces the Product-wide active-work rule.
3. Cloud Scheduler starts a Cloud Run Job in `--once` mode. The job presents a
   dedicated worker secret to a fixed Next.js coordinator origin.
4. The coordinator and Convex recheck the exact execution switch, Studio
   access, Product ownership, attempt, and lease before returning a frozen
   claim.
5. The worker checks cancellation and obtains an idempotent owner/global cost
   reservation immediately before every paid or expensive stage.
6. Long stages renew the lease and publish bounded progress. Integrity-checked
   checkpoints make a later execution resumable.
7. The worker uploads only to its frozen owner/Product namespace, verifies the
   SHA-256 and media facts with R2 HEAD plus ffprobe, and completes under the
   same lease.
8. A stale attempt, revoked access, disabled switch, changed source, uncertain
   paid boundary, or lost lease fails closed. It cannot overwrite an earlier
   immutable output.

Claims never contain provider credentials or signed URLs. They contain durable
identifiers, frozen recipes/options, and owned object identities. Provider and
R2 credentials are read only inside the worker runtime.

## Studio Clips job

The Clips contract is `studio-clips-claim-v2` with `initial` and
`render_revision` modes. The worker entrypoint is
`web/services/studio-clips-worker/runStudioClipsWorker.ts`. Its coordinator is
under `web/app/api/studio/clips/worker`, and its lease/checkpoint/cost ledger is
under `web/convex/studioClipsWorker`.

Initial claims acquire a fixed-host YouTube URL or an exact owned R2 upload,
require spoken audio, transcribe it, select grounded candidates, optionally
retrieve fixed-host Pexels B-roll, and render immutable clips. Revision claims
perform real trim, split, ordered merge, caption/style, deterministic rerender,
Product-style batch, and TikTok/Reels/Shorts export work from frozen output
lineage.

The runtime needs exact `STUDIO_BETA_ENABLED=true` and
`STUDIO_CLIPS_WORKER_QUEUE_ENABLED=true`, a unique
`STUDIO_CLIPS_WORKER_SECRET` of at least 32 bytes, a fixed
`STUDIO_CLIPS_WORKER_API_ORIGIN`, R2 credentials, AssemblyAI, and exactly the
configured Google or OpenAI analysis provider. Pexels is optional. The complete
variable and deployment list is in `supoclip-worker.md` and `.env.example`.

## Studio Stitch job

The Stitch contract is `studio-stitch-claim-v1`. The worker entrypoint is
`web/services/studio-stitch-worker/runStudioReelWorker.ts`. Its coordinator is
under `web/app/api/studio/stitch/worker`, and its lease/checkpoint/cost ledger is
under `web/convex/studioReelWorker`.

Each claim freezes the approved recipe and every owned R2 source. Classic
recipes can use existing reaction and demo media without a paid source call.
When a recipe requests sourcing or analysis, DanSUGC and Gemini are separately
reserved and checkpointed. A repeated DanSUGC purchase reservation reconciles
purchase history and never blindly purchases again. Talking recipes require
ElevenLabs audio with word timings before captioned rendering.

The runtime needs exact `STUDIO_BETA_ENABLED=true` and
`STUDIO_STITCH_EXECUTION_ENABLED=true`, a unique
`STUDIO_STITCH_WORKER_SECRET` of at least 32 bytes, a fixed
`STUDIO_STITCH_WORKER_API_ORIGIN`, and R2 credentials. DanSUGC, Gemini, and
ElevenLabs credentials are present only when the selected recipe needs them.
The complete variable and deployment list is in
`studio-stitch-execution.md`, the worker README, and `.env.example`.

## Publishing runtime

The publishing service is a separate Node 22 service at
`web/services/publishing-service`. Next.js is its authenticated gateway under
`web/app/api/studio/publishing`. PostgreSQL owns the durable transactional
outbox and immutable success receipts. Redis owns single-use OAuth state,
assertion replay protection, coordination, and tenant/global rate limiting.

The web gateway issues a short-lived, audience/action/tenant-bound service
assertion. The service accepts only its fixed API contract and never exposes
provider tokens. Before any provider-capable workflow advance, it calls the
secret-authenticated internal dispatch-access route. That route rechecks the
exact global switch, live grant and opt-in, and active owned Product in Convex.
Denial or authority failure reschedules without reading a provider credential,
granting media, or calling a provider. When the service-level Studio switch is
off, the outbox loop does not lease records.

The web application imports only narrow compiled package subpaths from
`@clipstitchr/publishing-service`; `npm run dev`, `npm run dev:webpack`, and
`npm run build` build that workspace first. Vitest aliases the same subpaths to
source so tests do not depend on ignored build output.

Publishing credentials and records remain separate from Zernio. No Studio job
or service reads, migrates, redirects, or dual-writes classic Zernio state.

## Process and network security

- Next and Convex worker secrets reject missing or weak configured values and
  compare supplied values with constant-work equality.
- Every coordinator body uses a declared-length check, streamed raw-byte cap,
  reader cancellation on overflow, and fatal UTF-8 decoding.
- Worker errors returned to users use authored public messages; provider bodies,
  filesystem paths, hosts, credentials, assertions, and signed URLs are not
  reflected.
- FFmpeg and ffprobe receive workspace-local input paths with the
  `file,pipe` protocol allowlist. Child environments contain only the minimal
  runtime variables and never inherit worker or provider secrets.
- Scratch directories are private, bounded, and removed after success,
  cancellation, or failure.
- YouTube, Pexels, DanSUGC, Gemini, ElevenLabs, Meta, TikTok, Google, and R2
  adapters validate fixed schemes and hosts, reject credentials in URLs, bound
  redirects and response bytes, and apply deadlines.
- R2 writes use owner/Product/task or run namespaces. Completion proves object
  version, content type, byte length, checksum, and probed media facts.
- Rate limits do not replace authentication or ownership. The complete
  per-owner/global policies and enforcement points live in
  `docs/operations/security/rate-limits.md`.

## Source references

The worker behavior was rewritten into ClipStitchr boundaries from literal,
non-executed source snapshots:

| Capability | Source snapshot |
| --- | --- |
| Clips | `web/vendor/supoclip/v0_1_0/upstream`, manifest `e8ee9d5ed41062e6a059c81835ca1834a49a651dcb6e5bcb6a25ad67f76fe098` |
| Stitch | `web/vendor/reelclaw/snapshot_bdeb17ca/upstream`, manifest `bdeb17cac41fd8040a39a32f660f336c1a6e5d608125efb1043b924ab9f4f426` |
| Publishing | `web/vendor/postiz/official_013db1da/upstream`, official commit `013db1dac7936054e77d40dd027ede0222771945`, manifest `ce69e41feb70f7453520f95f3de538813958833c894582cf755eb1322473ecc7` |

Run the matching `supoclip:verify-vendor`, `reelclaw:verify-vendor`, and
`postiz:verify-vendor` package scripts to recheck those trees.

## File tree

```text
web/
  app/api/studio/clips/                 user and Clips coordinator routes
  app/api/studio/stitch/                user and Stitch coordinator routes
  app/api/studio/publishing/            publishing gateway and media route
  convex/studioClips*/                  Clips state, leases, costs, outputs
  convex/studioReel*/                   Stitch state, leases, costs, outputs
  convex/studioPublishingScope/         live pre-dispatch access decision
  services/studio-clips-worker/         Clips Cloud Run Job
  services/studio-stitch-worker/        Stitch Cloud Run Job
  services/publishing-service/          Node service, PostgreSQL, Redis
  lib/clipstitchr/types/studioClips*/    versioned Clips contracts
  lib/clipstitchr/types/studioStitch*/   versioned Stitch contracts
```

## Verification and deployment status

Focused worker, route, Convex, provider, persistence, security, and recovery
tests accompany each boundary. Release verification also runs the exact root
typecheck, lint, full Vitest suite, optimized Next build, literal snapshot
verifiers, PostgreSQL suite, Redis suite, and credential-free `--check` inside
fresh `linux/amd64` Clips and Stitch images.

No Studio worker, scheduler, publishing service, schema migration, or provider
configuration was deployed to production as part of this implementation.
Convex code generation synchronized functions only with the configured
development deployment. The deployment recipes in the worker-specific docs are
operator instructions, not a deployment record.

## Known limits

- Live provider publishing, paid Stitch providers, and a real long-video Clips
  run require operator-owned credentials, approvals, credits, and an explicit
  production deployment; they are not claimed as live-smoked here.
- Clips intentionally omits SupoClip face-tracked pan, split-screen composition,
  emoji animation, transition assets, silence/filler cleanup, and free-text
  regeneration. Deterministic revisions and platform exports are real.
- The pure ReelClaw recipe engine can be used without a worker, but actual media
  generation remains credential- and recipe-dependent.
- Browser editor export is separate from these workers and remains capped at
  ten minutes by the browser-first product contract.
