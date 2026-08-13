# Studio Beta Implementation Plan

> Status: complete locally; production rollout remains separately authorized
> Started: 2026-08-12
> Scope source: `docs/planning/implementation/studio-beta-implementation-prompt.md`

## Objective

Build Studio Beta as an opt-in, access-controlled ClipStitchr workspace that
integrates substantial working portions of LazyReel, OpenCut, SupoClip,
ReelClaw, and Postiz without changing, migrating, redirecting, dual-writing, or
removing any classic ClipStitchr workflow.

The intended production flow is:

```text
Research -> Clips -> Stitch -> Edit -> Publish
```

Each phase must finish as a working vertical slice with focused tests,
documentation, browser verification, and an anti-slop UI audit. Planning or
placeholder screens are not phase completion.

## Non-Negotiable Boundaries

- Classic Hook Lab, Stitchr, Clipr, Swipr, Swapr, Library, Schedule, Analytics,
  and Zernio remain available on their current routes and data models.
- Studio records use separate, versioned schemas and object-key namespaces.
- Studio never automatically migrates, publishes, or dual-writes classic data.
- Clerk's immutable identity subject remains the authorization `ownerId`.
- Email addresses are never Studio authorization identifiers.
- Studio authorization is enforced at page, API, Convex, R2, worker, and
  publishing-service boundaries. Navigation visibility is only a convenience.
- The global kill switch fails closed unless its value is exactly `true`.
- Development authentication bypass never authorizes or previews Studio.
- Paid work is rate-limited, ownership-checked, and credit-gated before provider
  or compute cost begins.
- Production is not deployed or switched during this implementation.
- No production traffic, commit, push, or Zernio removal is authorized by this
  plan. The implementation prompt's repeated explicit prohibition controls over
  its final generic continuation sentence; a separate user instruction is
  required before any commit or push.
- Upstream install, postinstall, build, and bootstrap scripts are not executed
  merely to inspect source.

## Existing ClipStitchr Foundations To Reuse

- Clerk authentication and Clerk-subject ownership.
- Authenticated Convex HTTP clients and per-function ownership checks.
- Active Product context and product-scoped library records.
- Private owner-scoped R2 storage and signed URL routes.
- Durable Convex provider/media jobs, worker claims, retries, and Cloud Run
  dispatch recovery.
- Creation-credit reservations and active-generation capacity limits.
- Notification Center and current job tray.
- The warm graphite/copper dashboard system, accessible dialog primitives,
  workflow layouts, and mobile sidebar.
- Browser Media Bunny paths where browser processing is the stronger, documented
  option.

Studio-owned integration code must remain atomic even when an upstream snapshot
is retained inside a documented vendor boundary.

## Upstream Inventory Baseline

The supplied snapshots are source archives without usable Git metadata. Each
literal vendor boundary now carries an authoritative deterministic manifest
digest over every retained regular file. Historical inventory identifiers are
kept separately when their original fingerprint command was not available.

The supplied upstream source will be copied literally into documented vendor
boundaries before ClipStitchr adapters are added. Licensing is not an
implementation gate for this work. Original paths, notices, snapshot
fingerprints, and integration changes remain traceable so licensing can be
handled separately. Runtime adapters may still make narrowly scoped changes for
Next.js, Clerk, Convex, R2, Cloud Run, and Studio authorization.

| Upstream | Local source | Authoritative literal-copy digest | Relevant surface |
| --- | --- | --- | --- |
| LazyReel | `/Users/starship/GitHub/lazyreel-master` | `071ec70d9de377347767a6215df9ac849db46cf287203966800cf8abe85de356` | TypeScript MCP functions, committed corpus, methodology, Wiki, six companion workflows |
| SupoClip | `/Users/starship/GitHub/supoclip-main` | `e8ee9d5ed41062e6a059c81835ca1834a49a651dcb6e5bcb6a25ad67f76fe098` | Next.js frontend, FastAPI/FFmpeg worker, task lifecycle, captions, clip analysis and edits |
| OpenCut rewrite | `/Users/starship/GitHub/OpenCut-main` | `79b88f98506e83debf245a4dd66ba019f93e1dff2243fbb8238de8eb1a3632e5` | Current rewrite has a small Vite web surface and Rust-oriented future architecture; parity inventory distinguishes working code from roadmap claims and uses the official Classic browser source as the working editor baseline |
| ReelClaw | `/Users/starship/GitHub/reelclaw-main` | `bdeb17cac41fd8040a39a32f660f336c1a6e5d608125efb1043b924ab9f4f426` | Classic short-reel recipe and talking-video JSON/FFmpeg pipeline with ElevenLabs timestamps |

The historical LazyReel identifier `39ca03b2...` and supplied OpenCut identifier
`8eefd45a...` remain in their provenance records as non-authoritative inventory
baselines because their original algorithms were not supplied. Exact-copy
verification uses the manifest digests in this table.

The supplied OpenCut rewrite has no working editor implementation. Phase 3 will
therefore vendor a pinned official `opencut-classic` revision literally. The
rewrite scaffold stays recorded as the originally supplied snapshot, but it
cannot be the editor parity baseline.

Postiz has Git history:

- Local checkout: `/Users/starship/GitHub/postiz`
- Local checkout commit: `857c206284680fb8148444cab71fb69975d6d7b4`
- Official upstream: `https://github.com/gitroomhq/postiz-app.git`
- Official upstream HEAD observed on 2026-08-12:
  `013db1dac7936054e77d40dd027ede0222771945`
- ClipStitchr's prior integration: `9af6be8536860149f9dc9ea5b5d9a6f1f50cd977`
- Revert: `4968c167b28a20cff6c95ebf4e6f62bc18681607`
- Zernio replacement: `bd0a2ce4b6c0264eab338d3be72b68790d1fb5ea`

Phase 6 must fetch or clone the official commit into an isolated source checkout,
record the exact imported commit, compare it with both the previous ClipStitchr
integration and current Zernio architecture, and never run Postiz's `postinstall`
or database-reset scripts during inspection.

## Architecture And Migration-Free Coexistence

### Access plane

Studio access is the intersection of three independently enforced facts:

```text
STUDIO_BETA_ENABLED === "true"
  AND active studioBetaAccessGrants row for Clerk ownerId
  AND studioBetaPreferences.enabled === true for that ownerId
```

`studioBetaAccessGrants`, `studioBetaPreferences`, and
`studioBetaAuditEvents` are separate tables. An atomic Convex helper is the
canonical data check. Next.js and workers also fail closed on their local
server-only switch before consulting Convex, so a missing switch in any runtime
cannot accidentally open Studio.

### Data plane

- Access control records are isolated from feature records.
- Each imported capability gets focused tables rather than a generic Studio
  document.
- Mutable project formats carry an explicit schema version and immutable
  revisions where reopening or export reproducibility requires them.
- Large transcripts, corpora, timelines, raw provider payloads, and binary media
  stay out of hot Convex documents. R2 or a focused service database owns those
  payloads, while Convex stores bounded summaries and durable identities.
- Studio R2 objects live under `users/{ownerId}/studio/v1/...` and must pass both
  owner-prefix and Studio-access checks before a signed URL is created.
- Classic Library records may be read as Studio inputs. Studio writes a classic
  Library item only after an explicit save/accept action and retains lineage to
  the Studio source record.

### Job plane

- Every long-running or paid operation creates a durable Studio job before cost
  begins.
- A worker rechecks global enablement, grant status, preference, owner, Product,
  idempotency, rate limit/credit provenance, and owned R2 inputs before claim or
  start.
- If access is revoked or the switch is disabled, queued work remains preserved
  but cannot be claimed. A running job stops before its next paid or external
  side effect when safe. If stopping after an external acceptance boundary could
  corrupt state or duplicate an effect, the job records the uncertain state and
  reconciles rather than blindly retrying.
- Cancellation never deletes source drafts or completed outputs unless the user
  separately requests deletion.

### Publishing plane

- Zernio remains the classic Schedule and Analytics provider.
- Postiz Beta uses only `/dashboard/studio/publishing/*`,
  `/api/studio/publishing/*`, separate credentials, separate records, and a
  separate publishing runtime.
- PostgreSQL owns durable Postiz Beta outbox, schedules, attempts, leases,
  receipts, and reconciliation state. Redis owns short-lived OAuth state, replay
  protection, coordination, and applicable limits.
- Convex may expose bounded product-facing summaries, but it does not replace the
  transactional publishing ledger.
- Publishing destinations are TikTok, Instagram, and YouTube only.

## Phase Gates And Vertical Slices

### Phase 0: Inspection And Planning

Status: complete

- [x] Read repository and nested instructions.
- [x] Read the complete implementation prompt, coding guidelines, project scope,
  development-auth boundary, workspace UX system, product context, notification,
  LazyReel review, R2, rate-limit, and durable-worker documentation relevant to
  the initial slice.
- [x] Inspect current worktree and preserve the untracked user-authored prompt.
- [x] Inventory all upstream roots without executing them.
- [x] Record source fingerprints and Postiz history/remote mismatch.
- [x] Complete bounded source inventories for each upstream and the prior Postiz
  integration, then add feature/parity inventories to the relevant phase docs.
- [x] Create this durable plan in the existing planning tree.

Exit evidence: this file, source fingerprints, current `git status`, and review
notes tied to the upstream files actually inspected.

### Phase 1: Studio Beta Foundation

Status: complete locally; production remains disabled

Vertical slice 1A, canonical access model:

- Add atomic validators and tables for grants, preferences, and audit events.
- Add exact-true global enablement helpers for Convex, Next.js, provider worker,
  media worker, and future services.
- Add authenticated access-state query and `assertStudioBetaAccess`.
- Add worker/operator access checks that do not rely on development bypass.
- Cover unauthenticated, missing grant, disabled preference, enabled access,
  revoked grant, and disabled global switch.

Vertical slice 1B, operator controls:

- Add rate-limited, secret-protected grant, revoke, and list operations.
- Compare `STUDIO_BETA_OPERATOR_SECRET` in constant time.
- Reject email-shaped identifiers and require a Clerk owner subject.
- Audit grants and revocations without storing secrets.
- Add `studio-beta:grant`, `studio-beta:revoke`, and `studio-beta:list` npm
  commands with human-readable output and no hardcoded owner ID.

Vertical slice 1C, opt-in and navigation:

- Add a client access-state hook/context with no optimistic authorization.
- Show a short Settings opt-in only to active allowlisted owners while the
  server switch is enabled.
- Audit opt-in changes and rate-limit the mutation.
- Show Studio navigation only when all three conditions are true.
- Keep disabled/revoked data untouched.
- Explicitly make `/dashboard/studio/*` unavailable under development bypass.

Vertical slice 1D, protected workspace shell:

- Add server route guard and one cohesive Studio layout.
- Add `/dashboard/studio` as a concise cutting-room home using the active Product
  and real Library metadata. Do not expose links for unfinished routes.
- Use a populated media contact sheet and timeline language as the visual
  signature, not a fake vendor dashboard.
- Add Next.js API guard with `401` for unauthenticated callers and `403` for
  authenticated ineligible callers.
- Add Studio R2 upload/download gates under the isolated object-key prefix.
- Add worker claim/start access contract tests before beta job types are added.

Vertical slice 1E, proof and documentation:

- Add `docs/features/studio-beta/access-control.md` and
  `docs/features/studio-beta/workspace.md`.
- Update `.env.example`, the rate-limit document, and relevant worker/security
  docs.
- Run focused tests, full tests, typecheck, lint, and build.
- Browser-test eligible and ineligible states at desktop and mobile sizes with
  pointer and keyboard input, refresh, direct route guessing, and direct API
  calls.
- Re-read and audit every anti-slop point. Fix every violation.
- Stop the development server.

Phase 1 is not complete until every required state is proven at page, API,
Convex, worker, and R2 boundaries.

### Phase 2: LazyReel Research Workspace

Status: complete locally; production remains disabled

Vertical slices:

1. Import the corpus, methodology, classifications, frameworks, examples, and
   Wiki into a documented read-only vendor boundary with provenance.
2. Port `get_status`, `niche_report`, and `study_videos` as authenticated,
   product-aware server functions while preserving sample sizes, evidence, and
   source links.
3. Add `teardown` for description, transcript, and validated supported URLs.
4. Add `make_brief`, `breakout_laws`, and `kill_the_slop` with saved runs and
   explicit observed-versus-inferred sections.
5. Port all six companion workflows as focused server capabilities and
   progressively disclosed UI tasks.
6. Add approved brief handoff into Studio Stitch and Studio Edit without
   changing Hook Lab records.
7. If ingestion is included, keep it operator-controlled, bounded, and honest
   about recency; never expose scraping administration to testers.

Required proof includes output parsing, corpus fidelity, safe links/URLs,
ownership and Product isolation, cost limits, persistence, keyboard/mobile UI,
documentation, and anti-slop audit.

### Phase 3: OpenCut Browser Editor Rewrite

Status: complete locally; browser export remains intentionally capped at ten minutes

Vertical slices:

1. Produce a source-level working-feature inventory. Separate the current
   rewrite's implemented behavior from roadmap claims and inventory the official
   classic browser source when needed for the requested working editor parity.
2. Define versioned editor project/revision schemas and Library/Studio media
   adapters.
3. Port the editor shell into a server-renderable Next.js route with a lazy
   browser client. No iframe, Vite production app, duplicate auth, or duplicate
   media library.
4. Deliver media import, populated preview, timeline ordering, trim/split,
   transform, volume/mute/fades/speed, text/captions, transitions, undo/redo,
   shortcuts, autosave, reopen, and revision history in tested increments.
5. Read the complete Media Bunny guide/API references before changing browser
   processing. Keep multi-clip composition on a fresh `Output` with retimestamped
   samples rather than `Conversion`.
6. Add authenticated background export only for work that cannot reliably finish
   in-browser; save final output to owned R2 and the active Product Library.

Each included upstream behavior needs a working test or an explicit documented
exclusion before parity can be claimed.

Local proof: the complete OpenCut Classic tree is pinned at commit
`cf5e79e919144200294fb9fed22a222592a0aeea` with a 1,128-file verified literal
snapshot. Studio has versioned projects, Product media adapters, a populated
preview, timeline commands, inspectors, autosave/reopen, keyboard history,
fresh-`Output` Media Bunny export, owner-scoped R2 storage, and Product Library
save. The tested parity matrix and explicit exclusions are maintained in
`docs/features/studio-beta/editor.md`.

### Phase 4: SupoClip Clips Workspace

Status: complete locally; production remains disabled and final integrated
browser verification remains part of Phase 7

Vertical slices:

1. Inventory SupoClip frontend, FastAPI, task, transcript, caption, edit, and
   worker behavior; define the retained feature list and removed duplicate
   infrastructure.
2. Add separate versioned task/output records and an authenticated Cloud Run
   clipping worker or service. Do not modify the classic media worker into a
   second monolith.
3. Add tightly validated YouTube forms plus local owner-scoped uploads, source
   preview, bounded metadata/download preflight, and SSRF/redirect defenses.
4. Add queued lifecycle, progress, history/detail, cancellation, resume/retry,
   cleanup, and recovery.
5. Add transcript, candidate selection, reasoning scores, captions/styles,
   B-roll, orientation, edit operations, regeneration, and platform exports.
6. Add explicit accept-to-Library, open-in-editor, and send-to-Studio-Stitch
   actions.
7. Add Docker `--check`, local/deployment docs, and all cost gates without
   deploying the worker.

Current proof: the literal 317-file SupoClip snapshot verifies at
`e8ee9d5ed41062e6a059c81835ca1834a49a651dcb6e5bcb6a25ad67f76fe098`.
The isolated Studio Clips worker core now validates claims and owned sources,
enforces fixed-host YouTube redirects, checks Studio/Product/lease scope,
reserves owner/global cost before each paid stage, publishes progress and
checkpoints, classifies failures, cleans bounded temporary storage, validates
durable output targets, and passes a credential-free `--check`. Product-scoped
Convex task/output persistence, live lease-safe subscriptions, accepted-output
Library materialization, Studio Edit/Stitch handoffs, and the complete Clips
workspace are implemented. The concrete Cloud Run runtime wires bounded
YouTube/R2 acquisition, media probing, transcription, grounded clip analysis,
optional B-roll, FFmpeg rendering, R2 storage, heartbeats, and durable
completion evidence. Immutable render revisions execute trim, split, ordered
merge, caption/style rerenders, deterministic regeneration, Product-wide style
rerenders, and TikTok, Reels, and Shorts exports while retaining the original
output and lineage. The worker image is verified locally and remains
undeployed.

### Phase 5: ReelClaw Studio Stitch

Status: complete locally; production remains disabled and configured provider
calls remain environment-gated

Vertical slices:

1. Add versioned reel recipes, runs, outputs, and Product-grounded claims.
2. Deliver the classic 7-15 second workflow using existing UGC/Demo media first,
   optional DanSUGC sourcing, demo analysis, chosen segments, overlays, music,
   transitions, and variations.
3. Deliver talking-video scripts, supported hook families, voice assignment,
   ElevenLabs word timestamps, synchronized captions, music mixing, reaction and
   demo cutaways, CTA ending, and reopenable timeline recipe.
4. Generate a representative review subset before the rest of a batch and keep
   every paid operation separately limited/credited.
5. Add Library, Studio Edit, and Postiz Beta handoffs. Classic Stitchr remains
   unchanged.

Missing providers render a clear unavailable state rather than a control that
fails after click.

Current proof: the complete supplied ReelClaw snapshot verifies at
`bdeb17cac41fd8040a39a32f660f336c1a6e5d608125efb1043b924ab9f4f426`.
The deterministic V1 engine plans both classic and talking recipes, keeps
Product/Hook Lab claim provenance, enforces timing and caption contracts,
selects representative batch-review subsets, and serializes strictly.
Immutable recipes, generation runs, review subsets, outputs, idempotency
receipts, provider readiness, and the full Studio Stitch workspace are
implemented. The authenticated worker claims leases, rechecks access and cost
gates, checkpoints every provider boundary, executes configured DanSUGC,
Gemini, ElevenLabs, and FFmpeg paths, records uncertain paid outcomes for
reconciliation, verifies R2 checksum and ffprobe evidence, and materializes an
accepted output to the Product Library with durable Edit and Publish identities.

### Phase 6: Postiz Beta Publishing Beside Zernio

Status: complete locally; live provider publication remains credential- and
approval-dependent and is not claimed

Vertical slices:

1. Read the complete prior integration code/docs at `9af6be85`, the revert,
   current Zernio code/tests, and official Postiz source at the exact recorded
   commit. Produce a retained/rewritten/removed provider inventory.
2. Restore the isolated publishing-service boundary with PostgreSQL, Redis,
   durable outbox/scheduler, per-destination attempts, leases, idempotency,
   immutable success receipts, uncertain outcomes, and reconciliation.
3. Add short-lived tenant/action/audience-bound service assertions, replay
   protection, encrypted versioned token envelopes, fixed provider hosts,
   OAuth state, PKCE where supported, and owned-media resolution.
4. Deliver TikTok, Instagram, and YouTube connection management and required
   provider-specific settings. No other Postiz providers are included.
5. Deliver compose, drafts, immediate/scheduled publishing, calendar, post
   list/detail, destination states, cancellation, safe retry, partial success,
   analytics, and sync.
6. Preserve Zernio routes, settings, records, APIs, tests, and behavior. Add
   explicit regression coverage proving no cross-provider write or route change.
7. Document unavailable credentials/approval honestly and do not claim live
   publishing without an observed provider result.

Local proof: the official Postiz tree is pinned literally at commit
`013db1dac7936054e77d40dd027ede0222771945`. The isolated publishing service
implements PostgreSQL outbox state, Redis coordination and OAuth replay
protection, tenant/action-bound assertions, encrypted tokens, TikTok,
Instagram, and YouTube connections, durable scheduling, attempts, safe retry,
uncertain outcomes, reconciliation, compatibility checks, and analytics. The
Product-scoped Studio gateway and complete publishing UI are implemented without
changing or dual-writing Zernio. Focused service, PostgreSQL, Redis, gateway,
and UI suites are green. Missing external credentials disable the corresponding
provider with direct copy; they do not replace implementation with fake success.

### Phase 7: Integrated Completion Audit

Status: complete locally; authenticated production-environment smoke testing
remains a rollout prerequisite because the local Clerk and provider values are
placeholders

- [x] Exercise Research -> Clips -> Stitch -> Edit -> Publish with one active
  Product and durable route transitions.
- [x] Verify drafts, selections, outputs, jobs, and publishing state survive route
  changes and refresh.
- [x] Verify cross-user, cross-Product, classic-versus-Studio, and R2 isolation.
- [x] Verify revocation/global-disable behavior across every queued/running class.
- [x] Run all targeted suites and the complete `npm test`, `npm run typecheck`,
  `npm run lint`, and `npm run build` gates.
- [x] Browser-test the locally reachable desktop/mobile, pointer/keyboard,
  focus, direct route/API denial, and representative workspace controls; retain
  authenticated live persistence as a configured-staging check.
- [x] Perform a complete point-by-point anti-slop audit for every Studio route and
  fix every issue.
- [x] Confirm no dev server remains running.
- [x] Produce a requirement-by-requirement evidence matrix against the original
  implementation prompt. Missing or indirect evidence means the goal remains
  active.

## Cross-Phase Test Matrix

Every phase adds focused tests for the boundary it introduces. The cumulative
matrix includes:

- Access: unauthenticated, not allowlisted, disabled preference, enabled,
  revoked, global switch off, direct route/API/Convex/worker calls, and dev
  bypass.
- Isolation: owner, Product, R2, classic-versus-Studio, and provider boundary.
- Durability: drafts, revisions, jobs, cancellation, retry, idempotency, partial
  results, cleanup, lease recovery, and uncertain external outcomes.
- Product behavior: LazyReel parsing/evidence, SupoClip lifecycle, editor save/
  reopen/export, reel recipes/batches, Postiz OAuth/token/provider contracts,
  media compatibility, and TikTok/Instagram/YouTube settings.
- Regression: classic routes and Zernio publishing/analytics.

## Documentation Tree

The planned feature documentation is:

```text
docs/features/studio-beta/
  access-foundation.md
  workspace.md
  data-model.md
  worker-architecture.md
  lazyreel-research.md
  editor.md
  clips-worker-core.md
  supoclip-worker.md
  reelclaw-recipe-engine.md
  studio-stitch-execution.md
  postiz-publishing.md
  verification-matrix.md
```

Each document records the user workflow, architecture, security boundaries,
rate limits, providers, environment variables, provenance, file tree, tests,
limitations, and relationship to classic ClipStitchr.

## Completion Evidence

The final local pass completed on 2026-08-13:

- Six deterministic vendor verifiers passed across 2,635 retained files.
- `npm test` passed 1,242 web files / 3,842 tests, followed by 43 publishing
  service files / 250 tests. Coverage was 59.26% statements, 53.69% branches,
  56.37% functions, and 59.75% lines.
- `npm run typecheck` passed the web app and publishing service.
- `npm run lint` completed with zero errors and eight unrelated existing
  warnings outside Studio.
- `npm run build` passed and generated 206/206 static pages. Both Studio Stitch
  output actions resolve below the same `[outputId]` segment.
- Isolated PostgreSQL integration tests passed 2 files / 19 tests; isolated
  Redis integration tests passed 1 file / 5 tests.
- Full and production-only `npm audit` checks reported zero vulnerabilities.
- Studio Clips and Studio Stitch final `linux/amd64` worker images passed their
  credential-free in-container checks. Neither image was pushed or deployed.
- Real-browser desktop and mobile passes covered the fail-closed route, direct
  API denial, pointer and keyboard navigation, visible focus, Escape focus
  return, control sizing, horizontal overflow, and representative real Research,
  Clips, Stitch, and Edit components. The audit fixed hidden mobile drawer
  focus, sub-44-pixel controls, the clipped Stitch mobile navigation, stale
  execution copy, and a dynamic-route collision.
- The local Clerk keys are placeholders, so an authenticated live persistence
  pass and provider-result smoke test could not be performed honestly. Those
  are environment-gated rollout checks, not replaced by fixture success.
- Every local server and disposable Redis test container was stopped. No
  production deployment, migration, provider call, commit, push, or traffic
  switch was performed.

The next action, if separately authorized, is to configure real Clerk, Convex,
R2, worker, PostgreSQL, Redis, and provider secrets in a controlled staging
environment, then run the documented authenticated smoke checks before any
production traffic is enabled.
