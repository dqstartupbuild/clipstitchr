# Postiz Source Integration Plan

## Status

- State: implementation plan approved by repository requirements; implementation in progress.
- ClipStitchr repository: `/Users/starship/GitHub/clipstitchr`
- Postiz source repository: `/Users/starship/GitHub/postiz`
- Audited Postiz source commit: `cf4c432c00c9db775ea1b1f12480a8e2b89aec32`
- Upstream project: `gitroomhq/postiz-app`
- Imported-code license: GNU Affero General Public License v3.0 (AGPL-3.0)
- Product scope: Instagram and TikTok publishing only.

## Outcome

ClipStitchr will own a first-party publishing workspace at `/dashboard/publishing`. Users will connect Instagram or TikTok accounts, compose from durable ClipStitchr media, publish immediately or schedule a post, inspect per-destination status, retry recoverable failures safely, and view supported analytics without leaving ClipStitchr.

The implementation will reuse only the minimum Postiz source needed for publishing. It will not embed a second branded application, use Postiz authentication, expose unrelated providers, or preserve Postiz billing, AI, marketplace, public API, extension, command, or administration surfaces.

## Non-Negotiable Acceptance Criteria

1. The repository contains no tracked filename matching `* 2.*`, and no reachable local Git history contains one.
2. Convex generated bindings match the current schema and functions.
3. The checkout is connected to the existing ClipStitchr Convex cloud project without committing local deployment credentials.
4. Postiz-derived files are confined to one clearly marked import boundary and retain source and license provenance.
5. Provider registration contains only Instagram, Instagram Standalone where required by Postiz, and TikTok.
6. ClipStitchr remains Clerk-authenticated. Postiz JWT cookies, impersonation, and organization-selection authentication are not imported.
7. Publishing tenant identity is based on immutable Clerk user and organization IDs, never an email address.
8. Every media lookup, post, integration, analytics record, retry, and webhook/polling operation is tenant-scoped on the server.
9. OAuth state is cryptographically random, short-lived, provider- and tenant-bound, and single-use. PKCE is used when the provider supports it.
10. Provider access and refresh tokens are encrypted at rest with authenticated encryption and never returned to the browser or logs.
11. Publish operations are durable and idempotent per destination. A provider success followed by an internal write failure cannot create a duplicate post on retry.
12. Scheduled work receives a just-in-time provider-readable media URL. A short-lived R2 URL is never persisted as the future schedule payload.
13. TikTok inbox or user-action-required outcomes are represented honestly and are not labeled as published.
14. Expensive and state-changing routes enforce both authorization and documented per-user/global rate limits before work or provider cost begins.
15. Existing Post Bridge publishing is removed only after pending jobs and preserved history have an explicit disposition.
16. Typecheck, build, lint, targeted unit/integration tests, migration checks, and browser workflow checks pass.
17. The final UI is tested with pointer and keyboard input at desktop and mobile sizes and audited point by point against the complete anti-slop design law.
18. No live Instagram or TikTok publish is claimed unless it is actually verified with valid provider credentials and an observable provider result.

## Repository Boundaries

### Postiz-derived source

The bounded import will live under `web/vendor/postiz/`. Files in this directory may preserve upstream grouping where restructuring would make updates or license provenance harder to audit. Every imported file will be listed in a provenance manifest with its upstream path, source commit, local path, modification state, and purpose.

The imported directory will include its own `README.md`, `LICENSE`, source manifest, and modification notes. It will not contain `.env` files, Git metadata, build artifacts, dependencies, uploads, screenshots, test reports, caches, or generated runtime data.

### ClipStitchr-owned source

All adapters, Clerk tenant resolution, HTTP gateways, media bridge logic, encryption, rate limits, route mounting, navigation, copy, tests, and operations code will live outside `web/vendor/postiz/` and follow the repository's one-file-one-purpose rule.

### Repository policy exception

`AGENTS.md` and `coding-guidelines.md` will document the narrow imported-code exception. It applies only to verbatim or traceably modified files listed in the provenance manifest. New ClipStitchr code does not inherit the exception.

## Minimum Import Map

### Frontend behavior to adapt

- Calendar and scheduled-post views from Postiz launches/calendar.
- Post list, status, failure, retry, and result inspection.
- Composer behavior needed for Instagram and TikTok destinations.
- Integration connection and account status surfaces for those providers.
- Analytics views only where the selected provider and API support the data.
- Shared frontend utilities required directly by these views.

The UI will be mounted behind ClipStitchr routes and navigation. Postiz logos, names, shell navigation, billing prompts, Copilot, support controls, organization chooser, and unrelated links will be removed.

### Backend behavior to adapt

- Integration management and token refresh.
- Posts, destinations, publish attempts, scheduling, retries, and analytics.
- Instagram, Instagram Standalone where technically required, and TikTok provider implementations.
- The PostgreSQL transactional outbox, persisted provider checkpoints, and
  long-running dispatcher required for durable scheduled publishing.
- The minimum PostgreSQL/Prisma data model used by these capabilities.
- Redis-backed ephemeral state and coordination needed by OAuth, queues, and provider protection.

### Explicit exclusions

- Postiz authentication, JWT cookie, impersonation, and organization selection.
- Billing, subscriptions, marketplace, referral, and payment code.
- AI/Copilot content features.
- Browser extension, CLI/commands, SDK, MCP, and public API products.
- Admin and support consoles.
- Webhook products unrelated to Instagram/TikTok publishing status.
- All social providers other than Instagram, Instagram Standalone where required, and TikTok.
- Postiz brand assets and product marketing copy.
- Example, fixture, demo, cache, distribution, coverage, dependency, or uploaded-media directories.

## Route Shape

- `/dashboard/publishing`: enters the retained shell at its calendar route.
- `/dashboard/publishing/calendar`: scheduled work in calendar form.
- `/dashboard/publishing/posts`: drafts, queued posts, live results, failures, and retries.
- `/dashboard/publishing/analytics`: supported account and publication analytics.
- `/dashboard/publishing/integrations`: Instagram and TikTok connections.
- `/dashboard/publishing/compose`: focused creation flow when a dedicated route is clearer than an in-place dialog.
- `/api/publishing/*`: Clerk-protected ClipStitchr gateway endpoints.

Legacy `/dashboard/schedule` and `/dashboard/analytics` will redirect to or become thin compatibility entry points for the new workspace only after the corresponding replacement is usable.

## Identity and Tenancy

### Tenant key

The effective publishing tenant is:

- the active Clerk organization ID when one exists; otherwise
- a personal tenant derived from the immutable Clerk user ID.

Email, display name, slug, and mutable profile fields are metadata only. A user-to-tenant membership record records the Clerk IDs and role used for each authorized request.

### Service boundary

The browser talks only to ClipStitchr routes. A server-side gateway resolves Clerk identity and sends a short-lived, audience-bound service assertion to the publishing service. The assertion includes tenant ID, actor ID, allowed action, request ID, issued time, expiry, and nonce. The publishing service rejects browser cookies and never trusts a tenant ID supplied directly by the client.

### Authorization

Every query and mutation scopes by tenant before loading a record. Object IDs are not authorization. Integration ownership, media ownership, post ownership, analytics ownership, and retry ownership are checked independently of rate limits.

## Data Model and Migrations

The detailed core-and-sidecar contract is maintained in
`docs/features/publishing/publishing-persistence-model.md`.

The reduced PostgreSQL model will include focused records for:

- publishing tenants and Clerk memberships;
- provider integrations and encrypted credentials;
- durable media references to ClipStitchr/R2 assets;
- posts and provider-specific destinations;
- schedules and workflow/outbox state;
- per-destination publish attempts and provider receipts;
- analytics snapshots and refresh runs;
- OAuth state and replay disposition when persistence beyond Redis is useful;
- audit events for sensitive connection, publish, retry, and deletion actions.

Migrations will be additive until cutover. Destructive cleanup will be a separate, reversible phase after retained Post Bridge records and pending schedules are accounted for.

## OAuth and Credential Security

- Generate at least 128 bits of state entropy with a cryptographic random source.
- Store one structured state record containing a hash of the state, tenant, actor, provider, redirect target, PKCE verifier metadata, creation time, and expiry.
- Consume state atomically with `GETDEL` or an equivalent transaction so callbacks cannot be replayed.
- Bind callback handling to the expected provider and exact allowed return path.
- Use PKCE wherever supported by the provider.
- Encrypt provider tokens using versioned AES-256-GCM envelope encryption or a managed KMS equivalent with a unique nonce and authentication tag per value.
- Keep the token-encryption key separate from service-signing and application secrets.
- Redact authorization codes, tokens, state, assertions, signed URLs, and provider payload secrets from logs and errors.
- Fail closed in production if PostgreSQL, Redis, the outbox runtime, token
  encryption, service authentication, R2 media verification, or required
  provider configuration is absent.

## Durable Publishing and Idempotency

1. A create or schedule request writes each destination, attempt,
   idempotency key, and due-time outbox record in one database transaction.
2. A long-running Node.js service leases due rows with PostgreSQL
   `FOR UPDATE SKIP LOCKED`; expired leases are recoverable after a crash.
3. Each destination has its own attempt record, stable idempotency key, and
   versioned workflow checkpoint.
4. Before a non-idempotent provider call, the dispatcher persists an intent
   checkpoint and checks for an existing successful receipt.
5. After a provider result, the immutable receipt is persisted before the
   destination can be considered complete.
6. Processing results are rescheduled in the same outbox and resume from the
   stored checkpoint. A restart never relies on process memory.
7. An attempt stranded after an intent checkpoint is reported as uncertain and
   is never repeated automatically. Explicit retry is offered only for a
   definitively failed result with no ambiguous remote operation.
8. New behavior increments the stored event or checkpoint schema instead of
   changing already-persisted semantics in place.

Shared provider protection will include the Instagram queue/concurrency limit required by the upstream behavior and global safeguards for common credentials or spend.

## ClipStitchr Media Bridge

The bridge stores a durable reference to the source object, not an expiring download URL. It will:

- accept only authenticated, tenant-owned ClipStitchr assets;
- support the relevant saved stitch, swipe, clip, upload, and other finalized media records that are actually durable;
- reject drafts or browser-only results until they are persisted;
- verify object existence, media type, byte length, and provider constraints;
- deduplicate by tenant plus stable source identity and immutable object version/checksum;
- mint a provider-readable URL immediately before upload or provider fetch;
- support provider `HEAD` and range-read requirements, especially for TikTok;
- avoid exposing raw R2 credentials or cross-tenant object keys;
- record enough provenance to diagnose which ClipStitchr result produced a post.

## Post Bridge Cutover

### Inventory

Before disabling Post Bridge, identify:

- active connected accounts;
- drafts and future schedules;
- in-flight or uncertain provider requests;
- published-result identifiers and retained analytics/history;
- user-facing copy, settings, routes, Convex tables, environment variables, tests, and operations docs.

### User impact

Post Bridge OAuth credentials cannot be silently converted into Postiz provider credentials. Users will reconnect Instagram or TikTok. The UI will explain this plainly.

### Pending work

Pending Post Bridge schedules will not be blindly duplicated or cancelled. Each receives an explicit disposition: complete on Post Bridge during a transition window, cancel with confirmation, or migrate only when provider semantics and idempotency can be proven. Historical status remains readable until the retention decision is complete.

### Removal order

1. Make the replacement workspace usable.
2. Freeze creation of new Post Bridge schedules.
3. Inventory and resolve pending work.
4. Switch navigation and creation actions.
5. Preserve or export required history.
6. Remove active routes, UI, secrets, worker calls, and provider configuration.
7. Remove obsolete Convex schema/functions only after retained records no longer depend on them.
8. Update landing, case-study, feature, security, deployment, and support documentation.

## Abuse Protection and Rate Limits

Limits will be enforced server-side before expensive work and documented in `docs/operations/security/rate-limits.md`.

At minimum, separate policies will cover:

- OAuth starts and callbacks;
- integration refresh and disconnect;
- media registration and provider URL minting;
- draft creation and updates;
- immediate publish and schedule creation;
- retry and cancellation;
- analytics refresh and polling;
- provider-status polling and webhook ingestion, if implemented.

Per-user or per-tenant fairness limits do not replace global provider/concurrency limits. HTTP rate-limit responses use status `429`, a clear human message, and retry timing.

## Webhooks and Polling

The implementation will not imply webhook support that Instagram or TikTok integration code does not provide. Any incoming webhook endpoint must validate provider signatures, timestamp/replay constraints, payload size, event identifiers, and tenant/provider mapping before accepting data. If status is polling-based, the UI and operations docs will say so and apply bounded backoff.

## User Experience Standard

- The retained Postiz shell keeps calendar, posts, analytics, and integrations as separate destinations instead of collapsing them into a custom hub.
- Connection, creation, calendar inspection, post inspection, analytics, and settings remain distinct tasks.
- Existing results open in a readable state before edit controls appear.
- Status and errors sit beside the affected account or destination.
- Paid, destructive, provider-visible, and expensive actions are explicit.
- Media and draft selections survive route changes where technically safe.
- Content is visible by default; no entrance animation gates access to text or controls.
- Every interactive control works with pointer and keyboard input and has a useful focus state.
- Mobile preserves the same task hierarchy without hiding required actions or clipping content.

## UI Design Direction

This is a ClipStitchr production workspace, not a Postiz reskin. It will reuse the established ClipStitchr shell and type/palette system while giving publishing one authored visual signature based on an actual content timeline and media artifacts. It will not use blue-purple gradients, glowy pill buttons, fake app-window props, generic icon tiles, floating decorative cards, default fill-plus-outline action pairs, dead controls, hidden entrance states, or a copied SaaS block stack.

Before completion, every applicable point in the repository's complete anti-slop law will be checked in the running desktop and mobile UI. Any failure found in that audit will be fixed before handoff.

## Licensing and Provenance Deliverables

- Root license decision covering the combined distribution.
- Full AGPL-3.0 license text accompanying Postiz-derived source.
- `THIRD_PARTY_NOTICES.md` naming Postiz, upstream URL, source commit, license, import date, and retained notices.
- `MODIFICATIONS.md` recording imported directories, removed providers, authentication changes, branding changes, and every ClipStitchr-specific modification category.
- `TRADEMARKS.md` clarifying that ClipStitchr names, logos, and brand assets are not granted merely by the source-code license.
- A browser-visible corresponding-source link for the network-deployed application.
- Machine-readable provenance manifest for every imported file.
- `web/vendor/postiz/README.md` explaining the boundary, update procedure, excluded source, and local modification rules.
- Package metadata aligned with the actual distribution license; no misleading ISC or MIT claims.
- Deployment/source-offer documentation needed for AGPL network use.

## Environment and Deployment

Expected production configuration includes:

- PostgreSQL: `DATABASE_URL`.
- Redis: `REDIS_URL`.
- PostgreSQL outbox polling, lease, concurrency, and retry configuration.
- ClipStitchr public callback origin and private publishing service origin.
- Clerk server verification configuration.
- Short-lived service assertion signing/verification configuration.
- Separate provider-token encryption configuration.
- Instagram/Facebook app credentials.
- TikTok app credentials.
- Existing R2 configuration needed by the media bridge.
- Provider and queue concurrency controls.

Secret values remain in the deployment secret manager. Example env files contain names and safe descriptions only. Worker and web deployment docs will identify ownership, order, migration procedure, rollback, observability, and smoke checks.

## Test Matrix

### Static and unit verification

- TypeScript typecheck and production build.
- Lint with no new warnings.
- Provenance manifest consistency and excluded-path scan.
- Provider registry contains only the allowed providers.
- Tenant resolution and membership roles.
- Service assertion issue/verify/expiry/audience/replay behavior.
- OAuth state entropy, expiry, binding, atomic consumption, and replay rejection.
- Token encryption round trip, authentication failure, versioning, and redaction.
- Rate limits and `429` retry metadata.
- Tenant-scoped record and media access, including cross-tenant denial.
- Provider URL just-in-time minting, expiry, `HEAD`, and range reads.
- Publish idempotency across provider-success/database-failure retries.
- Per-destination partial success, retry, cancellation, and action-required behavior.
- Analytics refresh authorization and bounded polling.

### Integration verification

- PostgreSQL migrations up and down where safe.
- Redis TTL and atomic state consumption against a real Redis service.
- PostgreSQL 18 outbox leasing, expired-lease recovery, checkpoint resume,
  terminal receipt idempotency, and dead-letter behavior.
- Clerk-authenticated gateway to publishing service with invalid assertion rejection.
- Provider adapters with deterministic fixtures and contract mocks.
- Post Bridge freeze/inventory/migration tooling on fixtures.

### Browser verification

- Signed-out redirect and signed-in tenant resolution.
- First connection flow and callback failure states.
- Compose from an owned ClipStitchr media item.
- Immediate publish confirmation and per-destination result.
- Future schedule creation, calendar display, edit/cancel rules, and status update.
- Retry of a recoverable failure without duplicate success.
- Analytics readable state and unsupported-metric messaging.
- Pointer and keyboard navigation on desktop and mobile viewports.
- Focus, contrast, clipping, overflow, loading, empty, error, and reduced-motion states.
- Point-by-point anti-slop audit with fixes followed by a repeat pass.

### Live provider verification

When valid test credentials are available, perform one Instagram and one TikTok connection plus the safest provider-approved publish/status flow. Record observable IDs and redact tokens. If credentials or provider approval are unavailable, report the exact unverified boundary instead of claiming end-to-end completion.

## Implementation Phases

1. Baseline and cleanup: complete duplicate history purge, Convex regeneration, cloud project reconnection, and green baseline build.
2. Provenance boundary: add licensing, import manifest tooling, policy exception, and a minimal source import.
3. Runtime foundation: reduced PostgreSQL schema, Redis, transactional outbox
   dispatcher, service boundary, health checks, and deployment configuration.
4. Security foundation: Clerk tenancy, service assertions, OAuth state/PKCE, credential encryption, authorization, audit logs, and rate limits.
5. Publishing domain: provider pruning, integration lifecycle, media bridge, posts, destinations, outbox, workflows, receipts, retries, and analytics.
6. ClipStitchr UI: routes, shell integration, rebrand, progressive disclosure, media launch actions, and status surfaces.
7. Cutover: Post Bridge freeze, pending-job resolution, history retention, active removal, copy cleanup, and schema cleanup.
8. Verification: automated tests, migrations, service smoke checks, browser QA, responsive/keyboard QA, security review, and full anti-slop audit.

## Completion Gate

The work is complete only when the acceptance criteria and test matrix have evidence. A compiling import, a static UI, mocked provider success, or a successful provider call without durable internal state is not end-to-end completion. Any missing credentials, provider approval, cloud service, migration authority, or live result will be named explicitly as a remaining blocker.
