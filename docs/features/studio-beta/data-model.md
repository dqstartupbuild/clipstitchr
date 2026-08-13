# Studio Beta Data Model

## Purpose

Studio Beta keeps access, research, clipping, editing, reel generation, and
publishing state in separate versioned records. This prevents an imported
workflow from corrupting classic ClipStitchr records and keeps high-frequency
task reads bounded.

Every Studio feature record is scoped to the immutable Clerk `ownerId` and,
where the feature concerns production work, the active ClipStitchr `productId`.
Those fields are server-resolved or independently checked. They are never
trusted merely because the browser submitted them.

## Storage responsibilities

```text
Convex
  access, preferences, audit events
  research runs, reports, briefs
  Clips tasks, events, checkpoints, outputs, receipts, cost reservations
  editor projects and write receipts
  Stitch recipes, runs, reviews, outputs, worker state, receipts, cost evidence

R2
  uploaded and generated media, posters, fonts, captions, bounded artifacts

PostgreSQL
  Postiz Beta connections, media identities, posts, attempts, receipts,
  outbox leases, analytics, and publishing audit events

Redis
  short-lived OAuth state, assertion replay protection, coordination,
  and publishing-service rate limits
```

Large binary media never belongs in Convex. Signed URLs are short-lived delivery
mechanisms and are not durable identities. Durable media records store an owned
R2 object key plus immutable size, checksum or revision, and verified media
facts where the downstream provider needs them.

## Convex records

### Access plane

| Table | Responsibility |
| --- | --- |
| `studioBetaAccessGrants` | One active or revoked allowlist grant per owner, including operator and revocation metadata |
| `studioBetaPreferences` | The owner's explicit opt-in without deleting data on opt-out |
| `studioBetaAuditEvents` | Grant, revoke, opt-in, and opt-out evidence without secret material |

Access records are not mixed into Product content. The canonical Studio guard
reads the grant and preference independently and also requires the exact global
switch.

### LazyReel research

| Table | Responsibility |
| --- | --- |
| `studioLazyReelResearchRuns` | Idempotent pending/completed/failed tool or workflow runs with bounded canonical input and result snapshots |
| `studioLazyReelSavedReports` | Explicitly saved, readable reports with non-destructive archive state |
| `studioLazyReelCreativeBriefs` | Draft/approved/rejected briefs and an optional approved Edit or Stitch handoff |

Every snapshot records a schema or source version, canonical JSON, and verified
byte length. Runs retain the LazyReel corpus snapshot version so later corpus
updates cannot silently change the evidence behind an existing result.

### Studio Clips

| Table | Responsibility |
| --- | --- |
| `studioClipsTasks` | Source, render options, lifecycle, progress, lease, cancellation, bounded analysis, and retry state |
| `studioClipsTaskEvents` | Append-only bounded progress and failure events for one attempt |
| `studioClipsCheckpoints` | Monotonic resumable pipeline snapshots by task and revision |
| `studioClipsOutputs` | Durable rendered object identity, SHA-256, media facts, edit revision, and optional classic Library materialization |
| `studioClipsRenderRevisions` | Immutable trim, split, ordered-merge, caption/style, regeneration, and platform-export work with source lineage |
| `studioClipsProductStyles` | Product-wide caption defaults and their optimistic revision |
| `studioClipsWriteReceipts` | Idempotency and request-fingerprint evidence for browser writes |
| `studioClipsCostReservations` | One recorded reservation per task attempt and paid/compute stage |

Tasks and outputs use public stable IDs in addition to Convex document IDs.
Worker leases are time-bounded and attempt-bound. A live task subscription reads
one bounded task detail while the event history is capped separately, avoiding
an ever-growing hot document.

Output edit data is versioned canonical JSON. A render revision creates durable
output evidence rather than overwriting a previously accepted object. Saving an
output to the classic Library is an explicit idempotent action and stores the
resulting `libraryClipId` as lineage.

### Studio editor

| Table | Responsibility |
| --- | --- |
| `studioEditorProjects` | Versioned project snapshot, name, active/archive status, and optimistic revision |
| `studioEditorProjectRevisions` | Immutable snapshots appended for every successful persisted project change |
| `studioEditorProjectWriteReceipts` | Idempotent create/autosave/archive/reopen request evidence |

`StudioEditorProjectV1` stores scenes, tracks, layers, timing, transforms,
audio, captions, and durable source references. The snapshot is capped at
256 KiB. Signed URLs, Blob URLs, decoded media, and binary timeline data are not
stored in the project.

### Studio Stitch

| Table | Responsibility |
| --- | --- |
| `studioReelRecipes` | Immutable canonical Classic or Talking recipe snapshots with reopen/archive state |
| `studioReelGenerationRuns` | Batch/remainder intent, requested recipes, provider readiness, lease, checkpoint, cancellation, and terminal outcome |
| `studioReelReviewSubsets` | Representative sample selection, remaining recipes, approval, and accepted sample outputs |
| `studioReelOutputs` | One durable checksum- and probe-backed result per recipe, acceptance, and downstream handoff metadata |
| `studioReelWriteReceipts` | Idempotent recipe, run, review, output, and handoff writes |
| `studioReelWorkerEvents` | Append-only attempt/recipe progress evidence |
| `studioReelWorkerCheckpoints` | Monotonic bounded execution snapshots |
| `studioReelWorkerCostReservations` | Provider, operation, invocation, and reservation provenance before paid work |

Browser-submitted readiness is not execution authority. The server derives
provider readiness from server-only configuration, freezes validated recipes
and owned R2 source identities into the claim, and records the exact provider
reservation used for each paid invocation. An invocation that may have crossed
a non-idempotent provider boundary but lacks a durable checkpoint becomes
`uncertain`; it is not blindly replayed.

## Publishing PostgreSQL ledger

Postiz Beta uses an isolated PostgreSQL schema inside
`web/services/publishing-service/prisma/schema.prisma`.

| Model | Responsibility |
| --- | --- |
| `ClipPublishingTenant` | One tenant binding for the Clerk owner and isolated service organization |
| `ClipPublishingIntegrationSecret` | Versioned authenticated-encryption envelopes for access and refresh tokens |
| `ClipPublishingMediaSource` | Immutable owned media source revision, checksum, manifest, and compatibility facts |
| `ClipPublishingPostState` | Product-scoped destination intent, workflow identity, disposition, and safe internal state |
| `ClipPublishingAttempt` | Numbered dispatch attempt, bounded checkpoint, provider operation identity, and safe error |
| `ClipPublishingReceipt` | Immutable observed provider result and response digest |
| `ClipPublishingReceiptPublication` | Unique provider publication identity and safe observable URL |
| `ClipPublishingOutbox` | Transactional event, availability, lease, delivery attempt, and dead-letter state |
| `ClipPublishingAnalyticsSnapshot` | Bounded account or post metrics for a defined observation window |
| `ClipPublishingAuditEvent` | Tenant/action/request audit evidence with safe metadata |

The retained historical `Organization`, `Integration`, `Media`, and `Post`
models are adapted by the focused `ClipPublishing*` models rather than exposed
as a second ClipStitchr account system. `productId` is required by the Studio
gateway for create, read, cancel, retry, calendar, and analytics operations.
A valid post paired with another Product returns the same safe not-found result
as an unowned record.

## Versioning and mutation rules

- Mutable records carry `recordVersion` and a monotonic `revision` where stale
  writes could lose user work.
- Canonical JSON is parsed through strict validators before persistence and
  stores a byte length beside the payload.
- Unknown keys, non-finite values, secret-shaped data, signed URLs, excessive
  depth, and over-cap payloads fail before storage.
- Idempotency receipts bind owner, Product, operation, target, and a normalized
  request fingerprint. Reusing a key with different input fails.
- Archive is non-destructive. Reopen changes status through a revision-checked
  write and does not clone or discard the saved snapshot.
- Provider success receipts are immutable. Later failures cannot replace an
  observed successful publication.
- Completed output objects are immutable. A user edit or regeneration produces
  a new revision or execution result with lineage.

## Ownership and indexes

Primary user lookups use compound indexes beginning with `ownerId` and
`productId`, followed by a stable ID, status, or creation/update time. Worker
claim indexes use status plus lease expiry but return only work that is then
revalidated for Studio access, owner, Product, attempt, and lease. A global
claim index is an execution scheduler, not an authorization shortcut.

Classic Library and Stitch records can be read as inputs only through their
existing owner/Product checks. A Studio result becomes a classic Library record
only after an explicit materialize/save action. No background migration or
dual-write exists.

## R2 identity

Studio-owned objects use the versioned prefix:

```text
users/{encodeURIComponent(ownerId)}/studio/v1/{kind}/{productId}/...
```

Kinds include source media, outputs, posters, editor artifacts, captions, and
fonts. Generic signed-URL keys carry both immutable owner and Product segments;
the route rejects another owner's prefix or another Product before signing.
Object keys also reject traversal, control characters, and query fragments.
Worker claims resolve durable keys, not caller-provided signed URLs. Completion
requires uploaded-object checksum evidence and verified media metadata before
the Convex or publishing ledger records the result.

## Security and limits

Every entry point performs authentication, Studio access, and active Product
ownership separately from its token buckets. Snapshot, body, list, event,
artifact, media, and worker-workspace caps keep records and temporary work
bounded. Exact limits and 429 behavior are maintained in
`docs/operations/security/rate-limits.md`.

Secrets and provider tokens are absent from all Convex feature tables. Postiz
Beta token envelopes are encrypted with a versioned service-only key. Logs and
safe errors must not contain bearer tokens, OAuth codes, signed URLs, API keys,
or unbounded provider bodies.

## Source references and file tree

The behavior represented by these records comes from literal verified source
boundaries documented in the feature-specific files. The owned data layer is:

```text
web/convex/schema.ts
web/convex/studioBetaAccess/
web/convex/studioLazyReel*/
web/convex/studioClips*/
web/convex/studioEditor*/
web/convex/studioReel*/
web/services/publishing-service/prisma/
web/lib/clipstitchr/types/
```

## Verification

Focused tests cover strict snapshot parsing, byte caps, optimistic revisions,
idempotency mismatch, owner/Product isolation, access revocation, lease
recovery, checkpoint monotonicity, cancellation, retry classification, output
proof, explicit Library materialization, Postgres constraints, outbox leasing,
immutable receipts, OAuth replay protection, and publishing Product isolation.

Schema verification requires Convex TypeScript generation, Prisma validation and
generation, repository typecheck, focused persistence suites, PostgreSQL and
Redis integration suites, and `git diff --check`.

## Known boundaries

- Binary media and large transcripts intentionally remain outside hot Convex
  documents.
- Classic and Studio data are related only by explicit durable source lineage.
- Redis is not a source of durable publishing truth.
- Production migrations and deployment are not run by this implementation.
