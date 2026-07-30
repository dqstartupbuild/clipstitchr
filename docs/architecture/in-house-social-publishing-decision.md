# In-house Social Publishing Decision

**Status:** Implemented behind a migration flag; production approval pending

**Last reviewed:** July 28, 2026

## Decision

ClipStitchr owns TikTok and Instagram account connections, product queues,
publishing state, and manual analytics. It uses official platform APIs and the
existing Convex, R2, billing, provider-job, worker-queue, dispatch-recovery, and
provider Cloud Run Job architecture.

No Postgres, Redis, Temporal, Postiz, SaaS Distro, or second scheduler service
is introduced. Apify may fill only otherwise-unavailable TikTok saves during an
explicit refresh; it is not a publisher or primary analytics source.

## Why

Post Bridge requires a separate customer subscription and owns account
credentials that ClipStitchr cannot safely migrate. The existing durable worker
infrastructure already provides the required ownership, scheduling,
idempotency, recovery, billing, and capacity boundaries. Reusing it keeps one
operational model and one source of truth.

## Consequences

- Users reconnect TikTok and Instagram directly.
- One logical post snapshots its target accounts and consumes one product queue
  slot.
- Each target has independent attempts and publications.
- Provider calls are at-least-once internally but final mutations are
  duplicate-safe externally.
- Ambiguous final calls become `outcome_unknown` and can only reconcile.
- Status reconciliation may run automatically; analytics refreshes may not.
- Inactive subscriptions hold not-started work. Reactivation requires review.
- Tokens are versioned AES-256-GCM ciphertext and are decrypted only in the
  server or provider worker.
- `SOCIAL_PUBLISHING_PROVIDER=post_bridge` is the rollout default and prevents
  dual publishing.

## Alternatives rejected

Running Postiz or another scheduler would duplicate the database, queue,
credentials, scheduler, deployment, and incident model. Copying Post Bridge
credentials is unsupported and would violate the provider ownership boundary.
Using Apify for posting or primary metrics would replace official APIs with a
less authoritative dependency. Hand-rolled time-zone logic was rejected in
favor of `date-fns` and `date-fns-tz`.

## Production gate

Code and mock tests do not satisfy platform approval. Production remains on
Post Bridge until TikTok Content Posting audit, URL ownership, callback and
webhook registration, Meta Advanced Access, required secrets, provider-worker
deployment, and authorized live smoke tests all pass.

Related documents:

- `docs/features/social-publishing/in-house-social-publishing-architecture.md`
- `docs/features/social-publishing/platform-approval-and-launch.md`
- `docs/features/social-publishing/post-bridge-migration.md`
- `docs/operations/deployment/automation-deployment.md`
- `docs/operations/security/rate-limits.md`
