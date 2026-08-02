# PostgreSQL Publishing Persistence

## Purpose

The publishing service reuses only the focused Postiz `Organization`,
`Integration`, `Media`, and `Post` records. ClipStitchr-owned records use the
`ClipPublishing` prefix and add Clerk tenancy, encrypted credentials, durable
media identity, idempotent destinations, provider checkpoints, immutable
receipts, recoverable outbox delivery, analytics observations, and audit
events.

The migration is implemented but has not been applied to production.

## Additive Migration

`prisma/migrations/20260802080000_baseline_focused_postiz_core/migration.sql`
creates the six focused core tables only on a fresh database. On an existing
Postiz database it preserves extra tables and columns and fails closed if a
required core column is absent.

`prisma/migrations/20260802090000_add_clip_publishing_sidecars/migration.sql`
then creates only new enums, tables, indexes, foreign keys, checks, functions,
and triggers. Neither migration drops, renames, truncates, or rewrites a
retained Postiz table. Production application still requires a verified restore
point and a separate deployment decision.

The focused Prisma schema includes all six `CreationMethod` values at audited
Postiz commit `cf4c432c00c9db775ea1b1f12480a8e2b89aec32`: `UNKNOWN`, `WEB`,
`MCP`, `API`, `AUTOPOST`, and `CLI`. This avoids enum decoding failures when a
focused query reads an older Postiz row.

## Security and Integrity

- A tenant key maps once to one Postiz organization. A database trigger rejects
  changes to that identity.
- Secret and receipt providers use a closed PostgreSQL enum for Instagram,
  Instagram Standalone, and TikTok.
- Database triggers reject a sidecar reference when its tenant, organization,
  integration, post, attempt, receipt, workflow, or provider does not match.
- OAuth reconnects restore the same tenant-and-provider integration row and
  persist only safe profile metadata, granted scopes, and credential expiry
  times. Provider tokens are persisted only as context-bound AES-256-GCM
  envelopes. The retained Postiz token fields hold a non-secret managed marker.
  PostgreSQL advisory locks serialize concurrent reconnects and rotations, so
  one token kind has monotonic versions and exactly one active envelope.
- `upsertPublishingProviderConnection` commits the safe integration metadata,
  access envelope, and optional refresh envelope in one advisory-locked
  transaction after OAuth state consumption. A missing refresh credential is
  preserved by default; only the explicit `revoke` policy retires it.
- `upsertPublishingProviderConnections` acquires account locks in stable order
  and commits every account discovered by a provider callback in one
  transaction, preventing partial Facebook-to-Instagram account saves.
- `refreshPublishingProviderConnection` acquires the same account lock,
  re-reads and decrypts the latest active credential, runs the injected provider
  refresh callback while serialized, and rotates the returned envelopes in that
  transaction. `disconnectPublishingIntegration` disables the integration,
  retires every active envelope, and writes its audit event atomically.
- Durable media stores ordered R2 object keys and versions. Browser blob URLs,
  signed URLs, and credential-bearing JSON are rejected before persistence.
  Every object also carries its own required content type plus optional duration,
  dimensions, video/audio codecs, and audio-presence fact for mixed bundles and
  provider compatibility checks. PostgreSQL rejects manifests without a
  per-object content type.
- Destination idempotency is unique by tenant, integration, and idempotency key.
  The service computes its canonical hash from content, durable media,
  destination, bounded non-secret destination settings, and the exact intent.
- Draft intent creates a retained draft plus its sidecar, with no provider
  attempt and no outbox work. Publish-now intent creates immediately available
  work. Exact schedule intent stores the canonical IANA zone, original local
  wall time, and UTC offset beside the resolved UTC instant. DST gaps are
  rejected; an overlap is selected by its explicit offset.
- Provider-specific settings are validated at the service boundary, then
  bounded again for size and secret-bearing keys before their canonical JSON is
  stored in `Post.settings`. Instagram placement and TikTok posting mode,
  privacy, interaction flags, AIGC and brand disclosures, consent, and creator
  info revision therefore participate in idempotency.
- Future outbox rows are not available before their scheduled UTC instant.
  Expired leases can be recovered without changing the deterministic workflow
  ID. A live lease can be completed, rescheduled with a safe error code, or
  dead-lettered; stale and wrong-owner transitions fail closed.
- Provider attempts store a bounded, non-secret, versioned protocol checkpoint
  and a typed provider operation ID. A retry reads the same attempt and resumes
  or reconciles rather than creating the external operation again.
- Published receipts may own normalized remote publication rows. TikTok can
  validly report `PUBLISH_COMPLETE` for a private post without returning a
  public post ID, so a published receipt may have no publication row and no
  public URL. Non-published receipts cannot own remote publications. Both
  receipt layers are immutable, and a destination can have only one published
  success receipt.
- State-shape checks cover source identity, cancellation, secret versioning,
  checkpoint size, outbox leasing, analytics subjects, and safe JSON bounds.
- Tenant list repositories are newest-first, cap every page at 100 records,
  accept bounded date/status/subject filters where relevant, and cap nested
  attempts, receipts, and publications. Integration projections omit all token
  fields.

## Transaction Flow

`createPublishingDestination` resolves the Clerk tenant, verifies the retained
integration and durable media ownership, and writes the Postiz post, publishing
state, and audit event in one PostgreSQL transaction. Publish-now and scheduled
destinations also write the initial attempt and due-time outbox event; drafts do
not. Concurrent identical calls return one committed destination. Reusing the
same key with changed content, media, settings, destination, or intent is a
conflict.

`createPublishingIntegration` is a reconnect-safe metadata upsert keyed by
tenant and provider account identity. OAuth callbacks should use
`upsertPublishingProviderConnection` so metadata and credentials cannot split
across a crash boundary. `storePublishingIntegrationSecret` remains available
for later single-credential rotations and keeps prior envelopes only as replaced
history. Tenant integration listings use an explicit safe projection and cannot
return token markers, refresh tokens, or envelopes.

`recordPublishingReceipt` writes the receipt and all remote publication rows in
one transaction before advancing the Postiz and ClipStitchr states. Repeating
the same response digest returns the committed receipt. A different published
success is rejected.

`readPublishingDestinationForDispatch` accepts only a live, owned outbox lease.
Its bounded result exposes the Clerk tenant identity at
`postState.tenant.tenantKey`, alongside safe integration metadata, durable media,
the latest attempt, and capped receipt history. It never includes a provider
token or encrypted credential envelope.

## File Tree

```text
prisma/
  schema.prisma
  migrations/20260802080000_baseline_focused_postiz_core/migration.sql
  migrations/20260802090000_add_clip_publishing_sidecars/migration.sql
src/persistence/
  <one input, type, validator, mapper, repository, or transaction per file>
tests/
  publishingPersistenceValidation.test.ts
  integration/publishingMigrations.postgres.integration.test.ts
  integration/publishingPersistence.postgres.integration.test.ts
  fixtures/focused-postiz-core.sql
```

## Verification

Unit verification:

```bash
npm run typecheck
npm test
npm run build
```

The PostgreSQL suite refuses to run without both an explicit ephemeral marker
and the isolated database name:

```bash
PUBLISHING_TEST_POSTGRES_EPHEMERAL=true \
PUBLISHING_TEST_DATABASE_URL=postgresql://cliptest:cliptest@127.0.0.1:55432/clipstitchr_publishing_test \
npm run test:postgres
```

The suite applies both migrations to fresh and populated PostgreSQL 18 schemas,
preserves existing extra columns and unrelated rows, rejects a raw sidecar
reapply, exercises concurrent idempotency and
leases, reconnect and secret-rotation concurrency, all three destination
intents, reschedule and dead-letter transitions, and proves direct SQL cannot
bypass the tenant, provider, state, or receipt invariants.

## Remaining Production Seams

- Apply the migration only after recording the backup or restore point and the
  approved migration revision.
- Deploy the production runtime with PostgreSQL and Redis readiness, graceful
  shutdown, and at least one warm Cloud Run service instance.
- Run the transactional-outbox dispatcher with instance-based CPU allocation;
  do not deploy it as a short-lived Cloud Run Job.
- Keep Post Bridge records in place until every inventoried schedule and
  uncertain processing record has an explicit cutover disposition.
