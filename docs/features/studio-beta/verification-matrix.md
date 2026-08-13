# Studio Beta requirement evidence matrix

This matrix maps the Studio Beta implementation prompt to local code, tests,
and explicit runtime boundaries. It is the completion ledger for the additive,
migration-free Studio workspace. A row is not considered complete when its only
evidence is UI copy or a saved intent.

Status meanings:

- **Implemented**: local behavior and focused automated evidence exist.
- **Environment-gated**: local implementation and automated proof exist, but a
  configured external service or credential is required for the named live
  observation.
- **Excluded**: the prompt explicitly allowed or required this boundary and the
  interface exposes no dead control for it.

## Global product and rollout boundaries

| Requirement | Status | Evidence |
| --- | --- | --- |
| Studio is additive and opt-in | Implemented | `web/convex/studioBetaAccess/**`, `web/app/dashboard/studio/**`, and `access-foundation.md` |
| Classic Hook Lab, Stitchr, Clipr, Swipr, Swapr, Library, Schedule, Analytics, and Zernio remain available | Implemented | Studio-only route/data namespaces; no classic redirect or Zernio provider write; publishing isolation tests |
| No automatic record migration or dual-publish | Implemented | Separate Studio tables, R2 namespace, publishing PostgreSQL ledger, and explicit materialization/handoff APIs |
| Active ClipStitchr Product is reused | Implemented | Every feature route and persistence entry point reloads an active owned Product |
| Clerk subject is the owner ID; email is not authorization | Implemented | Studio access validators and operator command tests reject email-shaped identities |
| No production deployment, traffic switch, commit, or push | Implemented | Work remains local; Cloud Run documentation and checks do not deploy |
| Missing production credentials do not block local implementation | Implemented | Provider readiness contracts and disabled UI states remain functional without fake success |
| Supplied upstream source is preserved literally | Implemented | Five vendor manifests plus both supplied and working OpenCut snapshots; deterministic verifier commands |
| Imported upstream code is treated as untrusted | Implemented | No upstream install/bootstrap execution; ClipStitchr adapters validate inputs and execute outside vendor boundaries |

## Access foundation

| Requirement | Status | Evidence |
| --- | --- | --- |
| Exact server-side global kill switch | Implemented | `STUDIO_BETA_ENABLED` exact-true helpers in Next.js, Convex, workers, and publishing service |
| Active allowlist grant | Implemented | `studioBetaAccessGrants` schema, owner index, grant/revoke operations |
| Personal Settings opt-in | Implemented | `studioBetaPreferences`, eligible-only Settings control, audited change |
| Audit sensitive access changes | Implemented | Append-only `studioBetaAuditEvents` without secrets |
| Fail closed when configuration is missing or false | Implemented | Access helper and boundary tests |
| Development auth bypass never grants Studio | Implemented | route, server, worker, and development-dashboard tests |
| Route guard on every `/dashboard/studio/*` page | Implemented | guarded Studio layout and direct-route tests |
| API guard on every `/api/studio/*` user route | Implemented | shared server access helper plus route tests |
| Convex operations independently authorize | Implemented | per-module auth, Studio access, active Product, and ownership helpers |
| R2 signing independently authorizes | Implemented | `/api/studio/r2/upload-url` and `/download-url` tests and owner-prefix validation |
| Worker claims recheck access and Product | Implemented | Clips and Stitch claim/lifecycle boundaries |
| Publishing service rechecks Studio scope | Implemented | gateway assertion and service assertion validation |
| `401` unauthenticated, `403` ineligible API, safe page denial | Implemented | access API/page tests |
| Revocation preserves records and stops new cost safely | Implemented | worker claim and pre-cost access checks; feature lifecycle docs |
| Secret management commands | Implemented | `studio-beta:grant`, `studio-beta:revoke`, `studio-beta:list` |
| Constant-time operator-secret comparison | Implemented | Convex operator validator and focused tests |
| Administrative rate limits and audit | Implemented | `studioBetaRateLimits/**` and access audit records |
| Required access-state test matrix | Implemented | unauthenticated, unlisted, opted-out, enabled, revoked, global-off, direct route/API/Convex/worker, and bypass coverage |

## Studio routes and shared experience

| Requirement | Status | Evidence |
| --- | --- | --- |
| `/dashboard/studio` | Implemented | Product contact sheet and cutting-room timeline home |
| `/dashboard/studio/research` | Implemented | LazyReel workspace |
| `/dashboard/studio/clips` | Implemented | Studio Clips workbench |
| `/dashboard/studio/stitch` | Implemented | Studio Stitch recipe/run workspace |
| `/dashboard/studio/edit` | Implemented | browser editor |
| Publishing root, compose, calendar, posts, analytics, connections | Implemented | guarded pages and canonical connections route; legacy integrations route remains compatible |
| Cohesive Studio sub-navigation | Implemented | shared `StudioWorkspaceNavigation` and publishing navigation tests |
| One primary task and progressive disclosure per route | Implemented | task-specific workspace components, result-first readers, and contextual actions |
| Product-scoped drafts survive navigation | Implemented | durable Convex records and Product-keyed publishing client drafts |
| Durable identifier handoffs, never signed URLs in navigation | Implemented | `briefId`, output/source IDs, destination ownership reloads |
| Real cutting-room visual identity | Implemented | populated contact sheet/timeline surfaces and route-specific warm graphite system |
| Desktop/mobile, pointer/keyboard, focus, refresh, and state proof | Environment-gated | real-browser desktop/mobile guard, direct API denial, pointer, keyboard, focus, Escape return, sizing, overflow, and representative real workspace components passed; authenticated live persistence requires non-placeholder Clerk credentials |
| Complete anti-slop audit | Implemented | point-by-point static and browser pass fixed hidden drawer focus, sub-44-pixel controls, mobile Stitch navigation clipping, overflow, stale capability copy, and dead/ambiguous action states |

## LazyReel Research

| Requirement | Status | Evidence |
| --- | --- | --- |
| Complete supplied source/corpus/Wiki snapshot | Implemented | `web/vendor/lazyreel/v0_1_0`, 120-file verifier, 24 Wiki documents |
| `niche_report` and all five focus modes | Implemented | pure engine, strict request union, focused tests |
| `study_videos` | Implemented | corpus-backed filters/search and structured results |
| `teardown` description/transcript/supported URL | Implemented | strict TikTok/Instagram URL handling; original heuristic semantics are labeled |
| `make_brief` | Implemented | server-grounded active Product facts and saved brief |
| `breakout_laws` | Implemented | structured observed/derived/heuristic output |
| `kill_the_slop` | Implemented | deterministic evidence-labeled rewrite guidance |
| `get_status` without token leakage | Implemented | status engine and no secret-prefix exposure |
| Six companion workflows | Implemented | deterministic plan/manifest results with honest `plan_only` status |
| No separate MCP client | Implemented | authenticated Next.js routes call focused server functions; self-starting MCP entry is never imported |
| One job at a time | Implemented | UI workbench lock and tests |
| Saved runs and reports | Implemented | Product-scoped run/report tables and lifecycle functions |
| Saved/approved/rejected creative briefs | Implemented | versioned brief snapshots and approval lifecycle |
| Observed vs inferred evidence | Implemented | required evidence kind and snapshot version on each result |
| Safe original public links | Implemented | HTTPS TikTok/Instagram host validation |
| Research and Wiki progressive disclosure | Implemented | one selected Wiki document and bounded result readers |
| Approved brief to Stitch/Edit | Implemented | durable handoff state and destination routes that reload owned Product data |
| Hook Lab stays separate | Implemented | no Hook Lab schema migration or redirect |
| Ingestion administration not exposed | Excluded | snapshot-backed research is current scope; no fake real-time ingestion claim |

## OpenCut-derived Studio Edit

| Requirement | Status | Evidence |
| --- | --- | --- |
| Complete supplied rewrite source retained | Implemented | `web/vendor/opencut/rewrite_supplied_8eefd45a`, 127-file manifest |
| Working OpenCut browser baseline retained | Implemented | official Classic commit `cf5e79e...`, 1,128-file Git/archive verifier |
| Real Next.js App Router integration | Implemented | server-gated route plus lazily loaded client; no iframe or Vite production app |
| No duplicate auth, account, or file library | Implemented | Clerk, Studio access, Product Library, Studio outputs, and R2 adapters |
| Versioned projects and immutable revisions | Implemented | `StudioEditorProjectV1`, project/revision tables, optimistic revisions, idempotency |
| Library, Clips, Stitch, and local media import | Implemented | owned source catalog, handoff loaders, Studio upload path |
| Video, image, text, voice, music, caption layers | Implemented | strict layer union and atomic inspectors/previews |
| Timeline reorder, frame trim, split | Implemented | pure commands and tests |
| Crop, scale, position, rotation, opacity | Implemented | inspector, preview, and render paths |
| Volume, mute, fades, speed | Implemented | audio settings, preview/export scheduling, gain tests |
| Text/caption styling | Implemented | typed styles, caption cues, draw paths |
| Restrained transitions | Implemented | none, crossfade, and dip subset with explicit parity record |
| Autosave, reopen, undo/redo, shortcuts | Implemented | bounded local history and durable autosave/reopen |
| Populated preview | Implemented | source resolution and synchronized transport |
| Multi-source Media Bunny export | Implemented | fresh `Output`, retimestamped visual/audio composition; no single-input `Conversion` |
| Save MP4/poster to R2 and Product Library | Implemented | owned upload and classic Library materialization |
| Background render for browser-unreliable work | Excluded | browser path is explicitly capped at ten minutes; no dead background control |
| Upstream parity inventory and exclusions | Implemented | `editor.md` source-level matrix |

## SupoClip-derived Studio Clips

| Requirement | Status | Evidence |
| --- | --- | --- |
| Complete supplied source retained | Implemented | `web/vendor/supoclip/v0_1_0`, 317-file verifier |
| YouTube URL and local upload | Implemented | fixed-host parser/downloader and owner-scoped R2 upload |
| Source preview | Implemented | Clips source picker and preview |
| Seven caption templates | Implemented | capability catalog and renderer mapping |
| Built-in and custom fonts | Implemented | 21 built-ins; validated owner-scoped TTF/OTF acquisition under 10 MiB |
| Font size/color and subtitle toggle | Implemented | strict task options and FFmpeg caption rendering |
| Optional Pexels B-roll | Implemented | separately cost-gated provider adapter |
| Vertical or original output | Implemented | render options and output proof |
| Durable background task lifecycle | Implemented | queued/processing/completed/error/cancelled/provider-unavailable records |
| Live progress and task history/detail | Implemented | lease-safe Convex updates and read-budget-safe subscription |
| Transcript, candidates, scores, reasoning | Implemented | bounded analysis DTO and UI |
| Preview/download and media facts | Implemented | private download URL plus checksum and ffprobe-backed metadata |
| Trim, split, merge, caption/style revisions | Implemented | immutable Product-scoped render revisions execute against verified source outputs, retain lineage and originals, and create new ordinary output records |
| Regeneration | Implemented | clean-master deterministic rerender and bounded instruction-based revision paths run through the revision worker without overwriting the source output |
| Platform-specific export | Implemented | immutable TikTok, Reels, and Shorts render presets execute through the revision worker and retain platform facts in the output lineage |
| Cancel, resume, retry, archive | Implemented | task API, lease/checkpoint recovery, non-destructive archive |
| Save accepted clip to Product Library | Implemented | idempotent explicit materialization route |
| Open accepted clip in editor or Studio Stitch | Implemented | durable Product-scoped handoffs after materialization |
| Clerk/Product/R2 replacement of duplicate SupoClip infrastructure | Implemented | no SupoClip auth, billing, admin, marketing, storage, or Product shell imported into runtime |
| Separate Cloud Run worker | Implemented | `web/services/studio-clips-worker`; classic media worker unchanged |
| Authenticated claim and ownership/access/lease checks | Implemented | secret-gated worker routes and Convex claim mutation |
| Retryable/permanent failure, recovery, cleanup | Implemented | classified results, checkpoints, bounded temp workspace cleanup |
| Cost gates before every expensive stage | Implemented | download, transcription, LLM, B-roll, and rendering reservations |
| YouTube SSRF/redirect/size/duration/media defense | Implemented | canonical video ID, same-video redirects, 90-minute/1-GiB cap, ffprobe validation |
| Docker `--check` and image proof | Implemented | Node 22/npm 11.5.1 image, FFmpeg/ffprobe/yt-dlp/font checks, credential-free check |
| Production deployment | Excluded | explicitly not authorized |

## ReelClaw-enhanced Studio Stitch

| Requirement | Status | Evidence |
| --- | --- | --- |
| Complete supplied source/media retained | Implemented | `web/vendor/reelclaw/snapshot_bdeb17ca`, 14-file verifier |
| Separate classic and talking pipelines | Implemented | strict deterministic V1 recipe planners |
| Existing UGC/Demo sources | Implemented | Product-scoped source resolver and recipe fields |
| Optional DanSUGC sourcing | Environment-gated | fixed-host search, checkpointed selection, idempotent purchase reconciliation, bounded download, and durable reaction proof |
| Gemini demo analysis/segment choice | Environment-gated | grounded provider prompt/parser and independently cost-gated call |
| Classic 7-15 second assembly | Implemented | recipe timing plus FFmpeg execution worker |
| Overlays, music, transitions, variations | Implemented | versioned recipe and render segments |
| Talking 20-30 second seven-beat workflow | Implemented | hook/script/voice/caption/cutaway/CTA recipe contracts |
| ElevenLabs voice and word timestamps | Environment-gated | server-only adapter, timing validation, independent cost gate |
| CapCut-style captions and music mix | Implemented | recipe timing plus ASS/FFmpeg render path |
| Product-grounded claims | Implemented | server reloads Product/brief and records source provenance |
| Batch generation and representative review subset | Implemented | deterministic review selection and remaining-run lifecycle |
| Immutable recipes and reopen | Implemented | Product-scoped recipe lifecycle and snapshots |
| Secure lease/checkpoint/cancel/retry worker | Implemented | secret-authenticated atomic claim, lease recovery, cancellation observation, checkpoint revision, and classified failure boundary |
| Durable checksum/ffprobe output proof | Implemented | bounded worker probe plus immutable R2 version, size, and SHA-256 completion proof |
| Save output to Product Library | Implemented | authenticated idempotent materialization verifies R2 identity and creates a Product Library clip |
| Open output in editor | Implemented | materialization stores a durable `studioOutput` editor identity |
| Publish output through Postiz Beta | Implemented | materialization stores a durable `studio-stitch-output` publishing identity |
| Missing provider is visibly unavailable | Implemented | server readiness and disabled provider-dependent controls |
| Classic Stitchr unchanged | Implemented | isolated Studio routes, tables, recipes, and outputs |

## Postiz Beta publishing beside Zernio

| Requirement | Status | Evidence |
| --- | --- | --- |
| Prior ClipStitchr service inspected/restored safely | Implemented | `RESTORATION.md`, retained tree record, selective updates rather than blind cherry-pick |
| Current official Postiz retained at exact commit | Implemented | commit `013db1da...`, 929-file manifest and comparison |
| TikTok, Instagram, YouTube only | Implemented | provider unions, inventory, routes, workflows, UI, and tests |
| Duplicate Postiz auth/org/billing/marketplace/AI/admin/marketing/email/library removed | Implemented | focused service boundary and integration comparison |
| Separate routes, credentials, records, service, database, Redis, media references | Implemented | `/dashboard/studio/publishing/**`, `/api/studio/publishing/**`, `STUDIO_PUBLISHING_*` |
| Social connections, callback, health, refresh, reconnect/disconnect | Implemented | integration service and connections UI |
| Compose, drafts, immediate/scheduled intents | Implemented | Product-scoped composer and durable post ledger |
| Calendar, post list/detail, destination states | Implemented | service API, gateway, and pages |
| Partial success, cancellation, safe retry, uncertain outcomes | Implemented | per-destination attempts, immutable receipts, reconciliation rules |
| Account/post analytics and refresh | Implemented | normalized provider analytics and contextual refresh |
| Media compatibility and owned durable sources | Implemented | Library/Stitch/Swipe/Clips/Stitch-output manifests and gateway checks |
| TikTok settings and creator info | Implemented | privacy, consent, disclosure, interaction settings and tests |
| Instagram shape/carousel rules | Implemented | compatibility parser and provider workflow |
| YouTube settings, thumbnail, resumable upload | Implemented | title/description/visibility/audience/tags/thumbnail and checkpointed sessions |
| PostgreSQL transactional outbox and recoverable leases | Implemented | isolated Prisma schema/migrations and integration suite |
| Redis OAuth state, replay protection, coordination, limits | Implemented | isolated Redis implementation and integration suite |
| Audience/action/tenant-bound short-lived assertions | Implemented | gateway signing and service verification |
| Random provider-bound state and PKCE | Implemented | single-use Redis state and Google verifier flow |
| Authenticated token encryption and rotation | Implemented | versioned encryption envelopes and tests |
| Fixed provider hosts and SSRF-safe media | Implemented | URL allowlists, owned R2 grants, HEAD/range budgets |
| No blind retry after uncertain provider boundary | Implemented | outcome-unknown state and reconciliation |
| Per-user, tenant, and global limits with `429` timing | Implemented | Redis and gateway limits with Retry-After behavior |
| Provider credentials/approval unavailable state | Environment-gated | direct disabled UI copy; no fake live-publish claim |
| Zernio routes, settings, records, and APIs unchanged | Implemented | isolated namespace and regression coverage; no dual write |

## Data, abuse, and operations

| Requirement | Status | Evidence |
| --- | --- | --- |
| Separate versioned access/research/brief/clip/editor/reel/publishing records | Implemented | focused Convex tables and publishing PostgreSQL model; `data-model.md` |
| Owner and Product checks independent of rate limits | Implemented | shared access helpers and per-module ownership lookups |
| Large media outside Convex | Implemented | R2 object identities and bounded metadata; publishing PostgreSQL/Redis split |
| Bounded frequently read records | Implemented | summaries, limited lists, analysis/snapshot byte caps, subscription reservations |
| Compute/storage/bandwidth/provider abuse assessed | Implemented | `docs/operations/security/rate-limits.md` Studio tables and rationale |
| Limits before signed URLs, downloads, transcription, LLM, B-roll, voice, render, publishing, sync | Implemented | separate owner/global buckets and service limits |
| HTTP `429` responses include retry timing | Implemented | shared Studio API and publishing service error adapters |
| Worker secrets and provider credentials never exposed | Implemented | server-only env contracts, constant-time worker auth, redaction tests |
| Full npm dependency audit | Implemented | full and production npm audits report zero vulnerabilities locally |
| Worker architecture documentation | Implemented | `worker-architecture.md`, separate Clips and Stitch feature documents, and isolated runtime READMEs |

## Final verification record

The final local completion pass ran every required command:

```bash
cd web
npm run lazyreel:verify-vendor
npm run opencut-rewrite:verify-vendor
npm run opencut:verify-vendor
npm run supoclip:verify-vendor
npm run reelclaw:verify-vendor
npm run postiz:verify-vendor
npm test
npm run typecheck
npm run lint
npm run build
npm run publishing-service:test:postgres
npm run publishing-service:test:redis
```

Observed results:

- all six vendor verifiers passed: LazyReel 120 files, supplied OpenCut rewrite
  127, OpenCut Classic 1,128, SupoClip 317, ReelClaw 14, and Postiz 929;
- web coverage passed 1,242 files / 3,842 tests; the chained publishing service
  passed 43 files / 250 tests;
- coverage was 59.26% statements, 53.69% branches, 56.37% functions, and
  59.75% lines;
- exact typecheck passed; lint returned zero errors and eight unrelated existing
  warnings; production build passed with 206/206 static pages;
- PostgreSQL passed 2 files / 19 tests and Redis passed 1 file / 5 tests;
- full and production dependency audits found zero vulnerabilities;
- Studio Clips and Studio Stitch `linux/amd64` images passed offline
  in-container checks and were not pushed or deployed.

The real-browser pass used desktop 1440x900 and mobile 390x844 viewports. It
proved the fail-closed development-bypass page and `401 private, no-store` API
denial, pointer and keyboard navigation, visible focus, Escape focus return,
44-pixel mobile targets, no page-level horizontal overflow, and real Research,
Clips, Stitch, and Edit component interactions. Refresh/state, empty, loading,
success, error, unavailable, and cancelled behavior also has focused component,
route, persistence, and worker coverage. The temporary component QA route was
removed after inspection. Because the repository's Clerk values are
placeholders, no authenticated live Product persistence or external provider
result is claimed; both remain explicit staging rollout checks. The development
server and disposable test services were stopped.
