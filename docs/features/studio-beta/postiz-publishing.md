# Postiz Beta publishing

## What this feature is

Postiz Beta is the opt-in Studio publishing workspace for TikTok, Instagram,
and YouTube. It lives beside the existing Zernio-backed Schedule and Analytics
product. It does not replace, migrate, redirect, or dual-write Zernio data.

The public Studio paths are:

- `/dashboard/studio/publishing/compose`
- `/dashboard/studio/publishing/calendar`
- `/dashboard/studio/publishing/posts`
- `/dashboard/studio/publishing/analytics`
- `/dashboard/studio/publishing/connections`
- `/api/studio/publishing/*`

The former `/dashboard/studio/publishing/integrations` page is retained only
as a compatibility redirect to the canonical Connections workspace. Internal
OAuth return-path parsing still accepts that fixed legacy path so an
authorization flow started before the route rename can finish safely.

The interface calls the provider **Postiz Beta** so a user can distinguish it
from the existing publishing workflow before connecting an account or creating
a post.

## Source boundaries

Two independently traceable source boundaries support the implementation.

### Historical ClipStitchr service

`web/services/publishing-service` was restored literally from ClipStitchr
commit `9af6be8536860149f9dc9ea5b5d9a6f1f50cd977` before Studio-specific
adaptation. The historical subtree is Git tree
`f40f72e995386dc2ef6a6a6f1d0bb076e084851e` and contains 654 files.

The restored service supplies the focused PostgreSQL, Redis, OAuth, encrypted
token, outbox, lease, receipt, media-grant, Instagram, and TikTok foundations.
Its exact restoration record is in
`web/services/publishing-service/RESTORATION.md`.

### Current official Postiz source

The complete official Postiz tree is pinned without modification under
`web/vendor/postiz/official_013db1da/upstream` at commit
`013db1dac7936054e77d40dd027ede0222771945`.

The vendor boundary contains 929 files. Its manifest/tree digest is
`ce69e41feb70f7453520f95f3de538813958833c894582cf755eb1322473ecc7`.
The retained comparison against the historical ClipStitchr integration and
current Zernio architecture is
`web/vendor/postiz/official_013db1da/INTEGRATION_COMPARISON.md`.

The current official YouTube provider is the source reference for Google OAuth,
channel identity, resumable upload sessions, status probes, exact-byte resume,
titles, descriptions, visibility, made-for-kids settings, tags, thumbnails,
and analytics.

## Runtime architecture

The browser never talks directly to the publishing service or a social
provider.

```text
Studio browser
  -> /api/studio/publishing/*
     -> Clerk + Studio grant + active Product check
     -> short-lived action/audience/tenant service assertion
        -> isolated publishing service
           -> PostgreSQL ledger and transactional outbox
           -> Redis OAuth state, replay protection, coordination, rate limits
           -> fixed-host Instagram, TikTok, or Google provider adapter
```

PostgreSQL is authoritative for Postiz Beta destinations, attempts, schedules,
outbox events, leases, checkpoints, immutable provider receipts, and analytics
snapshots. Redis owns short-lived state only. Large media remains in R2.

Every browser-facing request first resolves the current Product on the server.
The Convex scope check independently requires Clerk authentication, Studio
access, an active owned Product, and owner/global read capacity. Product IDs
are then attached by the trusted gateway instead of accepted as an
authorization claim from the browser.

### Compiled workspace boundary

The Next.js application does not load publishing-service implementation files
as runtime source. `web/services/publishing-service` is the
`@clipstitchr/publishing-service` npm workspace and exposes these narrow value
subpaths from its compiled `dist` tree:

- `assertions/createServiceAssertionSigningKey`;
- `assertions/issueServiceAssertion`;
- `media-gateway/normalizePublishingMediaPublicOrigin`;
- `media-gateway/PublishingMediaGatewayTokenError`;
- `media-gateway/sealPublishingMediaGatewayToken`;
- `media-gateway/validatePublishingMediaGatewayTokenClaims`;
- `media-gateway/verifyPublishingMediaGatewayToken`.

The root `web` package runs `publishing-service:build` before `dev` and
`dev:webpack`, and as an explicit stage of `build`. The service build generates
its Prisma client and compiles NodeNext TypeScript before Next resolves those
workspace exports. This keeps `.js` NodeNext specifiers inside the service's
compiled package instead of asking Turbopack to interpret service source.
Type-only imports may point at the service source because they are erased; all
runtime values cross one of the package subpath exports above.

## Media flow

The composer accepts durable owned media references, never a persisted expiring
URL. Supported source responsibilities are:

- finished Studio outputs;
- durable Product Library video or image items;
- durable ClipStitchr stitches;
- retained immutable Swipe publishing bundles where available.

The gateway reloads the owned record, checks the active Product, reads the R2
object identity, and verifies content type, byte length, checksum/version,
dimensions, duration, and codec facts where applicable. It creates a short
lived provider-readable URL only immediately before provider work.

The media gateway supports bounded `HEAD` and range reads for TikTok and
YouTube. Each grant is bound to the exact R2 object identity and has independent
request and byte budgets. A changed object fails closed.

## Provider behavior

### Instagram

- Facebook Business and Instagram Standalone connection modes are retained.
- Feed, story, single-media, and bounded carousel compatibility is validated
  before persistence and again before dispatch.
- Container creation and status checks use durable checkpoints.
- Provider access and refresh tokens use versioned authenticated encryption.

### TikTok

- Direct publish and inbox delivery are distinct choices.
- Creator information is fetched before direct-post settings are accepted.
- Privacy, comments, duet, stitch, commercial-content disclosures, AI-content
  disclosure, music behavior, and explicit consent are stored per destination.
- Provider pull URLs are fixed-origin, owned-media grants with `HEAD` and range
  support.
- Pending publish IDs are reconciled rather than blindly re-created.

### YouTube

- Google OAuth is provider-bound and uses offline access for refreshable
  credentials.
- A post requires exactly one compatible video.
- Settings include title, description, public/private/unlisted visibility,
  made-for-kids, tags, and an optional durable thumbnail.
- Uploads use a resumable Google session. The workflow probes the session for
  the committed offset before every resume and records the session/offset in a
  bounded checkpoint.
- A lost response after the final chunk becomes an outcome-unknown/reconcile
  state until the session probe reports whether a video exists.
- Account and post analytics are normalized into the same bounded Studio
  analytics contract without exposing provider tokens.

### Provider enablement and approval limits

`STUDIO_PUBLISHING_ENABLED_PROVIDERS` is the production allowlist. It accepts
only `instagram`, `instagram-standalone`, `tiktok`, and `youtube`; production
requires TikTok plus at least one Instagram path, while YouTube and Instagram
Standalone are enabled only when explicitly listed. Each enabled path requires
its own `STUDIO_PUBLISHING_*` client ID and secret. Meta also requires an exact
version in `STUDIO_PUBLISHING_META_GRAPH_API_VERSION`, and TikTok server-hosted
media requires the exact HTTPS `STUDIO_PUBLISHING_TIKTOK_VERIFIED_MEDIA_ORIGIN`.
Disabled-provider credentials are ignored and cannot make that adapter
available.

Provider credentials do not replace external provider approval. Instagram,
TikTok, and YouTube remain unavailable for real accounts until the configured
apps, callback/media domains, permissions or scopes, and test accounts are
approved by the corresponding provider where required. Each enabled provider
still needs an authorized publish/status smoke check in that environment.
Until then, the UI shows the provider as unavailable and does not describe a
saved request, accepted response, or fixture ID as a live publication.

## Delivery and retry rules

- Draft creation performs no provider call.
- Immediate and scheduled posts create one durable destination and attempt per
  selected account.
- The database transaction creates the destination, attempt, and outbox event
  together.
- Workers claim recoverable leases and write bounded checkpoints.
- Immutable success receipts prevent a published result from being overwritten
  by a later failure.
- Automatic retries stop at an uncertain non-idempotent provider boundary.
- A user retry is available only when no receipt, remote publication, provider
  operation, or active outbox record could represent an existing post.
- Partial success is reported per destination; it is never flattened into a
  false all-or-nothing result.

## Security and abuse controls

- Studio is fail-closed unless `STUDIO_BETA_ENABLED=true`, the owner has a
  current grant, and the request is not using the development auth bypass.
- The publishing service parses the switch independently, reports `not_ready`
  unless it is exactly lowercase `true`, and returns `503` at its router
  boundary before authenticated routes or provider webhooks perform work.
- A disabled service does not start outbox leasing. While enabled, every leased
  record must pass a fresh secret-gated web and Convex check immediately before
  provider-capable work. That check reloads the exact global switch, current
  grant, owner opt-in, and the persisted Product's active owner relationship.
  Revocation, opt-out, ownership loss, archive, or an unavailable authority
  reschedules the record without a provider call.
- The service sends only the persisted Clerk owner ID and Product ID to a fixed
  app-origin `POST /api/studio/publishing/internal/dispatch-access` endpoint.
  Redirects are rejected and the request has a five-second timeout. The route
  accepts at most 4 KiB and exactly those two bounded fields.
- Every internal dispatch-access response, including `400`, `401`, and `503`,
  uses `Cache-Control: private, no-store`. The service rejects a declared
  `Content-Length` above 256 bytes before reading, enforces the same streamed
  cap, decodes UTF-8 fatally, and accepts only exact JSON
  `{ "allowed": boolean }`.
- The web route checks its dedicated secret in constant time before parsing.
  Its secret-gated Convex mutation freshly reloads the global switch, Studio
  grant, owner opt-in, and the persisted, non-archived owner/Product
  relationship, then reserves the 3,600/hour owner and 100,000/hour global
  publishing read budgets. Any denial or unavailable authority fails closed
  before provider credentials, media grants, checkpoints, or provider calls.
- Provider credentials use only `STUDIO_PUBLISHING_*` environment names and
  never read Zernio settings or secrets.
- Production app, media-gateway, and TikTok verified-media origins must be
  HTTPS, and the production Redis connection must use `rediss:`. Development
  and tests may use plain HTTP only on loopback hosts and may use local
  `redis:`.
- OAuth state is random, short-lived, provider-bound, tenant-bound, single-use,
  and replay-protected. PKCE is required where the provider supports it.
- Service assertions are short-lived and bind issuer, audience, tenant, action,
  request ID, and actor.
- `STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET` is an independent server-only
  service-to-web value. It is never returned to the browser or written to logs.
- Provider hosts are allowlisted exactly. Redirects are rejected unless an
  adapter explicitly validates the next fixed host.
- Logs and browser responses redact access tokens, refresh tokens, OAuth codes,
  signed media grants, authorization headers, and unbounded provider bodies.
- Redis enforces per-user, per-tenant, and global action limits before provider
  cost. The Convex scope and R2 media gateway have separate owner/global and
  request/byte limits.
- HTTP `429` responses include a bounded retry interval.

## Honest availability

A provider with missing credentials or external approval remains visible but
disabled with direct user-facing copy. The application may prove contracts,
state transitions, and test adapters without claiming a live publish.

A provider is described as live only after a real provider result has been
observed in the configured environment. No test fixture, queued intent,
accepted HTTP request, or locally generated ID is presented as a published
post.

## File tree

```text
web/
  app/
    _components/publishing/                 Postiz Beta workspace UI
    api/studio/publishing/                  authenticated and internal gateway routes
    dashboard/studio/publishing/            guarded Studio pages and styles
  convex/
    publishingMedia/                        owned durable media resolution
    studioPublishingScope/                  Product scope and live dispatch authorization
  lib/clipstitchr/publishing/
    api/                                    gateway request validation
    client/                                 browser contracts and requests
    identity/                               Clerk tenant resolution
    media/                                  compatibility and media grants
    service/                                service assertions and proxy
  services/publishing-service/
    package.json                            compiled workspace subpath boundary
    prisma/                                 isolated PostgreSQL schema/migrations
    src/dispatch-access/                    bounded live authorization client
    src/integrations/                       OAuth and connection routes
    src/provider-runtime/                   Instagram, TikTok, YouTube adapters
    src/publishing-api/                     compose/calendar/posts/analytics API
    src/workflow/                           checkpointed provider workflows
    src/outbox/                             durable dispatch and leases
    src/rate-limits/                        Redis owner/tenant/global limits
  vendor/postiz/official_013db1da/          immutable official source snapshot
```

## Verification

Run from `web/`:

```bash
npm run postiz:verify-vendor
npm run typecheck
npm run lint
npm test
npm --workspace @clipstitchr/publishing-service run typecheck
npm --workspace @clipstitchr/publishing-service test
```

Provider contract tests must cover OAuth state and replay protection, PKCE,
encrypted token rotation, fixed hosts, provider settings, resumable upload
probe/resume, uncertain outcomes, cancellation, safe retry, partial success,
media compatibility, analytics normalization, Product isolation, and 429
behavior.

Focused dispatch tests additionally prove that the disabled switch never
leases an outbox record; each provider-capable workflow authorizes the current
owner/Product before credentials, media, checkpoints, or provider calls; denial
and authority failures reschedule safely; the fixed route, shared-secret header,
timeout, redirect rejection, response cap, declared-length rejection, fatal
UTF-8 decoding, and exact response shape fail closed; and every web response is
private and non-cacheable. Environment tests prove that production requires a
dedicated dispatch secret and rejects short or reused secrets.

Before release, exercise the full Product-scoped path from a saved Studio or
Library result through compose, draft, schedule/immediate intent, per-provider
status, calendar, detail, and analytics. Repeat with missing provider
credentials to confirm the UI stays useful and honest without making a network
claim.

No service migration, Cloud Run deployment, provider connection, or live
provider smoke test was performed as part of this implementation. Deployment
remains a separate release operation after environment secrets, provider
approvals, migrations, and smoke-test accounts are ready.
