# Publishing Persistence Model

## Purpose

This document defines the PostgreSQL and Prisma boundary for ClipStitchr
publishing. The model keeps the focused Postiz publishing entities that the
adapted source expects, while adding ClipStitchr-owned sidecar records for
Clerk tenancy, encrypted credentials, durable media, idempotency, versioned
provider checkpoints, transactional outbox delivery, receipts, analytics, and
audits.

This is the target model for additive migrations. It does not mean a production
migration has been applied.

## Why the Core Postiz Tables Stay

The existing PostgreSQL database already contains the Postiz `Organization`,
`Integration`, `Media`, `Post`, `Tags`, and `TagsPosts` tables as part of a
larger schema. The publishing migration treats those tables as an existing
superset and leaves unrelated records, tables, and extra columns untouched.
Reusing the focused core avoids translating every Postiz query into a parallel
data model.

ClipStitchr does not reuse Postiz authentication, billing, subscriptions, AI,
marketplace, or unrelated provider tables. A Clerk tenant maps to one focused
Postiz `Organization`. There is no Postiz login, password, JWT cookie, or second
organization chooser.

## Core and Sidecar Ownership

| Record | Owner | Purpose |
| --- | --- | --- |
| `Organization` | Retained Postiz core | Publishing workspace container |
| `Integration` | Retained Postiz core | Connected Instagram or TikTok destination metadata |
| `Media` | Retained Postiz core | Provider-facing media row with a durable internal path |
| `Post` | Retained Postiz core | Draft, queued, published, or failed provider destination |
| `ClipPublishingTenant` | ClipStitchr | Immutable Clerk tenant key to `Organization` mapping |
| `ClipPublishingIntegrationSecret` | ClipStitchr | Versioned encrypted access and refresh token envelopes |
| `ClipPublishingMediaSource` | ClipStitchr | Tenant-owned Convex and R2 source identity plus immutable revision |
| `ClipPublishingPostState` | ClipStitchr | Stable request identity, source linkage, workflow identity, and disposition |
| `ClipPublishingAttempt` | ClipStitchr | One provider attempt with safe failure and timing data |
| `ClipPublishingReceipt` | ClipStitchr | Immutable observed provider success or action-required receipt |
| `ClipPublishingOutbox` | ClipStitchr | Due-time leasing, retries, polling, and dead-lettering for versioned provider work |
| `ClipPublishingAnalyticsSnapshot` | ClipStitchr | Bounded account or post metric observation |
| `ClipPublishingAuditEvent` | ClipStitchr | Actor, action, subject, request, and safe metadata trail |

## Tenant Mapping

`ClipPublishingTenant.tenantKey` is unique and uses one of these forms:

- `clerk-organization:org_<id>` when a Clerk organization is active;
- `clerk-personal:user_<id>` for a personal workspace.

The row owns exactly one `Organization`. The database never chooses a tenant
from email, display name, slug, request body, object ID, or provider account ID.
The private publishing service accepts tenant identity only from a verified,
single-use ClipStitchr service assertion.

The actor Clerk user ID is stored on sensitive audit records and attempts. It
does not become a Postiz `User` and does not create an alternate login path.

## Provider Credentials

The Postiz `Integration.token` and `Integration.refreshToken` columns must not
contain plaintext credentials. They hold a non-secret managed marker or remain
empty where the existing constraints permit it. The actual values live in
`ClipPublishingIntegrationSecret` as versioned AES-256-GCM envelopes.

Each envelope is authenticated with context containing:

- tenant key;
- provider identifier;
- integration ID;
- token kind; and
- encryption key ID.

Moving ciphertext to another tenant, provider, integration, or token kind must
fail authentication. Only a server-side provider activity decrypts a token,
immediately before use. Tokens, authorization codes, state, assertions, signed
URLs, and provider response secrets never enter browser responses, logs, audit
metadata, analytics rows, outbox payloads, or provider checkpoints.

## Durable Media

`Media.path` stores a durable internal descriptor, not a signed R2 URL. The
linked `ClipPublishingMediaSource` records:

- source kind and source record ID;
- immutable source revision;
- content checksum;
- one or more R2 object keys and object versions;
- media type and exact byte length;
- provider compatibility facts; and
- the tenant that owns the source.

The unique deduplication boundary is tenant plus source identity plus immutable
revision. A schedule stores this stable media identity. A provider activity
performs a fresh ownership lookup, R2 `HEAD`, compatibility check, and
just-in-time fetch grant immediately before the provider needs the bytes.

Saved Swipe carousels reference the complete ordered slide bundle. A poster or
browser blob URL is never accepted as a durable carousel.

## Post, Destination, and Workflow Identity

One retained `Post` row represents one provider destination. Posts that were
created from the same composer action share a Postiz group identifier. The
linked `ClipPublishingPostState` adds:

- a tenant-scoped idempotency key;
- a canonical request hash;
- the source Stitch, Swipe, or Library record and immutable revision;
- the stable workflow ID and optional runtime run ID;
- the migration or legacy Post Bridge mapping when applicable;
- cancellation and uncertain-outcome disposition; and
- the last safely observed internal state.

The idempotency key is unique per tenant and destination. Repeating an identical
authorized request returns the existing destination. Reusing the key with a
different canonical request hash is rejected.

## Transaction and Outbox Invariant

Creation or scheduling uses one PostgreSQL transaction:

1. resolve or create the Clerk tenant mapping;
2. verify the destination and durable media ownership;
3. write the focused Postiz `Post` row;
4. write `ClipPublishingPostState` with its idempotency key;
5. write the initial `ClipPublishingAttempt` intent when appropriate; and
6. write one pending `ClipPublishingOutbox` event.

The request is not reported as queued unless that transaction commits. A
long-running dispatcher leases the outbox row with PostgreSQL
`FOR UPDATE SKIP LOCKED` and resumes the versioned provider checkpoint using a
deterministic workflow ID. Re-leasing expired work resumes the same attempt; it
does not create a second publish operation.

Outbox leasing is bounded by owner and expiry. A crashed dispatcher leaves a
recoverable row. Delivery attempts and the safe last error are recorded without
placing provider secrets in the payload.

## Attempts and Immutable Receipts

Before a provider call, the activity creates or reuses the destination's stable
attempt intent. It checks for an existing successful receipt before performing
any external side effect.

After the provider responds, the service records the immutable
`ClipPublishingReceipt` before marking the destination complete. A receipt
contains only the provider identifier, external publication ID, observable URL
when safe, result class, observed time, and a redacted response digest or safe
metadata. The raw token-bearing response is not persisted.

Receipt result classes distinguish at least:

- published;
- accepted or processing;
- user action required;
- rejected;
- canceled; and
- uncertain.

A TikTok inbox or user-action-required result is never represented as
published. TikTok `PUBLISH_COMPLETE` is represented as published even when a
private post has no public post ID; its result URL and publication-ID list stay
empty. A retry skips any destination with an immutable success receipt. If the
provider may have accepted a request but no receipt was committed, the attempt
becomes uncertain and requires reconciliation before another publish call.

## Analytics and Audit Records

Analytics snapshots are append-only observations keyed by tenant, integration
or publication, metric window, and observed time. Refresh requests are rate
limited before provider work and never overwrite the provider receipt.

Audit events cover connection start and completion, disconnect, credential
refresh, create, schedule, cancel, retry, reconciliation, analytics refresh,
and destructive retention work. They store the actor Clerk user ID, tenant,
request ID, action, subject type and ID, result, and a small allowlisted metadata
object. They never store secrets or full provider payloads.

## Migration Rules

- Migrations are additive until the Post Bridge cutover and retention work are
  complete.
- New table and index names use the `ClipPublishing` prefix so the focused
  boundary is obvious in the shared database.
- The migration must not drop, rename, truncate, or rewrite an existing Postiz
  or ClipStitchr table during the additive phase.
- The Prisma schema may model only the focused Postiz core plus the new
  sidecars. It must not pull unrelated Postiz products into the service.
- Migration SQL is tested against a representative empty Postiz schema and a
  populated fixture, including apply, reapply rejection, rollback where safe,
  and preservation of unrelated tables.
- Production migration requires a database backup or verified restore point,
  recorded migration revision, and a readiness check before application traffic
  uses the new tables.
- Destructive legacy cleanup is a later, separately approved migration after
  all 36 inventoried future Post Bridge schedules and 25 unresolved processing
  records have an explicit disposition.

## File Tree Target

The implementation belongs under the publishing service, with one purpose per
file:

```text
web/services/publishing-service/
  prisma/
    schema.prisma
    migrations/<revision>/migration.sql
  src/persistence/
    <one repository, transaction, mapper, or type per file>
  src/workflow/
    <one provider workflow step, checkpoint codec, or port per file>
  src/outbox/
    <one lease dispatcher, retry rule, loop, or type per file>
  tests/
    <focused unit and integration tests>
```

The retained upstream schema fragment remains in
`web/vendor/postiz/libraries/nestjs-libraries/src/database/prisma/schema.publishing.prisma`
for provenance. It is not deployed directly.

## Verification Gate

Persistence is not ready for provider use until tests prove:

- Clerk tenant isolation on every integration, media, post, attempt, receipt,
  outbox, analytics, and audit lookup;
- encrypted token round trips and context mismatch rejection;
- stable idempotency under concurrent duplicate requests;
- one committed post and outbox event per accepted destination;
- expired outbox lease recovery without repeating an uncertain provider call;
- provider success receipt recovery after an internal failure;
- full Swipe bundle ordering and ownership;
- no persisted signed URL or blob URL;
- migration preservation of existing tables and data; and
- redacted diagnostics for every failure path.
