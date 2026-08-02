# Post Bridge to ClipStitchr Publishing Cutover

## Outcome

ClipStitchr is replacing Post Bridge with a first-party publishing workspace
powered by a bounded, modified Postiz source import. The replacement supports
Instagram and TikTok only. It remains inside the ClipStitchr shell and uses
Clerk for user and organization identity.

This document defines the safe cutover. It does not declare the cutover
complete.

## Target Workspace

| Route | Primary job |
| --- | --- |
| `/dashboard/publishing` | Enter the retained publishing shell at Calendar |
| `/dashboard/publishing/compose` | Create one immediate or scheduled post |
| `/dashboard/publishing/calendar` | Inspect scheduled work in time context |
| `/dashboard/publishing/posts` | Review drafts, queued work, results, and failures |
| `/dashboard/publishing/analytics` | Inspect supported provider analytics |
| `/dashboard/publishing/integrations` | Connect or manage Instagram and TikTok |

The older `/dashboard/schedule` and `/dashboard/analytics` routes remain
compatibility entry points until the matching replacement view is usable. They
must not send users to a dead, partial, or misleading surface.

The publishing root is not a separate overview. It enters the retained Postiz
shell and preserves Calendar, Posts, Analytics, and Integrations as distinct
destinations.

## What Changes for Users

- Existing ClipStitchr accounts continue to use Clerk. There is no Postiz
  account, Postiz JWT cookie, or second organization chooser.
- Instagram and TikTok connections must be connected again. Post Bridge OAuth
  credentials cannot be silently converted into the new provider credential
  records.
- Existing saved ClipStitchr media remains in the Library. The publishing media
  bridge references durable, tenant-owned assets and creates provider-readable
  access only when the workflow needs it.
- Historical Post Bridge results remain readable until the retention decision
  is complete.
- A TikTok result that still requires action in TikTok is labeled as requiring
  action. It is not labeled as published.

User-facing migration copy should be short and direct: reconnect Instagram or
TikTok once, then continue from the new publishing workspace.

## Cutover Inventory

Before freezing Post Bridge, capture a tenant-scoped inventory of:

- connected Instagram and TikTok accounts;
- drafts and future schedules;
- in-flight, timed-out, or uncertain provider requests;
- provider post identifiers and last known status;
- retained captions, media references, analytics, and error history;
- current navigation links, creation actions, API routes, Convex functions and
  tables, worker paths, secrets, environment values, tests, and support docs;
  and
- users who need to reconnect an account.

The inventory must be reproducible and must not log access tokens, refresh
tokens, signed media URLs, OAuth state, or raw provider secrets.

The first aggregate production inventory is recorded in
`docs/features/publishing/post-bridge-production-inventory-2026-08-02.md`.
It found 36 future schedules and 25 older processing records, so active Post
Bridge removal is currently blocked on explicit disposition and reconciliation.

## Pending Schedule Disposition

Do not duplicate or cancel a future Post Bridge schedule by default. Each
schedule needs one recorded disposition:

1. **Complete on Post Bridge**: let the existing provider execute it during a
   bounded transition window, then retain the result.
2. **Cancel with confirmation**: cancel only after the user or an approved
   operator confirms the action and the provider's cancellation state is
   observable.
3. **Migrate**: recreate it in the new service only when media durability,
   destination semantics, schedule time, and idempotency can be proven. Record
   the old and new identifiers together.

If the old provider outcome is uncertain, do not publish a replacement until a
reconciliation check makes duplicate risk acceptable and records the decision.

## Cutover Stages

### 1. Build the replacement without changing entry points

- Import only the approved Postiz source under `web/vendor/postiz/`.
- Implement the focused core-and-sidecar database contract in
  `docs/features/publishing/publishing-persistence-model.md` with additive,
  preservation-tested migrations.
- Complete the Clerk tenant boundary, provider credential encryption, OAuth
  replay protection, durable media bridge, per-destination idempotency, rate
  limits, PostgreSQL migrations, Redis requirements, and transactional-outbox
  workflows.
- Verify Instagram, Instagram Standalone where required, and TikTok are the
  only registered providers.
- Publish the exact-source offer required by the root GNU AGPL version 3
  posture before exposing the modified service to remote users.

### 2. Run an internal shadow period

- Keep Post Bridge as the production path.
- Exercise account connection, immediate publish, scheduling, cancellation,
  retry, analytics refresh, expired tokens, missing media, and provider errors
  against non-production or approved test accounts.
- Compare provider results and internal state without creating duplicate public
  posts.

### 3. Freeze new Post Bridge creation

- Disable new Post Bridge schedules and immediate publish actions.
- Keep result inspection, reconciliation, and approved cancellation available.
- Show one clear path to reconnect an account in the new workspace.
- Record the freeze time and the inventory snapshot used for disposition.

### 4. Resolve pending work

- Apply one explicit disposition to every pending schedule.
- Reconcile every in-flight or uncertain operation.
- Preserve required history and export data before deleting any old record.
- Confirm that the new workflow skips any destination with a recorded success
  receipt.

### 5. Switch product entry points

- Point dashboard publishing navigation to `/dashboard/publishing`.
- Point media-level publish actions to the new compose route with durable media
  identity, never an expiring signed URL.
- Turn `/dashboard/schedule` and `/dashboard/analytics` into tested
  compatibility redirects or thin entry points.
- Preserve only equivalent, bounded query values through those redirects;
  discard arbitrary return URLs and unrelated parameters.
- Remove Post Bridge product and marketing copy only after the replacement path
  is usable.

### 6. Remove active Post Bridge runtime

- Remove active API calls, worker dispatch, provider secrets, settings fields,
  and connection UI.
- Keep read-only history or a verified export for the approved retention
  period.
- Remove obsolete Convex schema and functions only when no retained record or
  rollback path depends on them.
- Update operations, security, deployment, support, terms, and privacy docs.

## Promotion Gates

Do not advance from one stage to the next unless the applicable checks pass:

- tenant isolation tests cover integrations, posts, analytics, media, retries,
  cancellation, polling, and webhook handling if present;
- OAuth state is cryptographically random, provider- and tenant-bound,
  short-lived, and consumed once;
- provider tokens are encrypted with authenticated encryption and never reach
  browser responses or logs;
- schedule payloads store durable media identity rather than a short-lived R2
  URL;
- each destination has a stable idempotency key and immutable success receipt;
- PostgreSQL, Redis, and the long-running outbox dispatcher fail closed when
  required production configuration is absent;
- server-side rate limits run before provider cost or state changes;
- migration and rollback procedures have been exercised on representative
  data;
- typecheck, build, lint, targeted tests, and full tests pass;
- pointer and keyboard flows work at desktop and mobile sizes;
- the exact Corresponding Source is available and the running UI source link
  has been tested; and
- a live provider publish is claimed only when an observable provider result
  was verified with authorized credentials.

## Rollback

Rollback is allowed only while it does not recreate duplicate-post risk.

- Keep the Post Bridge inspection path and credentials available during the
  bounded transition window, but freeze new creation after stage 3.
- Keep additive database migrations reversible until retained history no
  longer needs them.
- Preserve an immutable mapping between old and new post, schedule, destination,
  and provider identifiers.
- If the new service fails before a provider call, return the item to a safe
  queued state.
- If failure happens after a provider may have accepted a post, reconcile the
  provider receipt before retrying or returning work to Post Bridge.
- Roll back navigation independently from data when the old inspection view is
  still safe and the new creation flow is not.

## Completion Evidence

The cutover is complete only when the release record links to:

- the final inventory and every pending-item disposition;
- migration and rollback verification;
- provider registration and tenant-isolation test results;
- OAuth, encryption, media, idempotency, and rate-limit test results;
- the deployed commit and image or build digests;
- the exact Corresponding Source URL and archive checksum;
- desktop and mobile browser verification; and
- the list of removed Post Bridge routes, secrets, functions, tables, workers,
  settings, tests, and docs.

Until that evidence exists, describe the work as a migration in progress.
