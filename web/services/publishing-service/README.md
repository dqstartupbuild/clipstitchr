# ClipStitchr Publishing Service Foundation

This package is the ClipStitchr-owned security and runtime boundary for the
publishing service. It targets Node.js 22 and intentionally has no runtime
dependency on imported Postiz application code. Its focused runtime dependencies
are Prisma/PostgreSQL and the retained Postiz-compatible `ioredis` major
version.

## What this package owns

- strict parsing of publishing-service configuration;
- production startup checks that fail closed when required infrastructure,
  identity, provider, or cryptographic configuration is absent;
- immutable publishing tenant identity derived only from Clerk user and
  organization IDs;
- short-lived HMAC service assertions between the Clerk-protected web gateway
  and this private service;
- Redis-backed assertion replay protection using atomic `SET NX PX`, plus an
  in-memory implementation reserved for tests and local development;
- single-use OAuth request state with 256-bit entropy, an explicit PKCE
  capability, and exact tenant, actor, provider, redirect URI, and return-path
  binding;
- atomic per-tenant and global Redis rate limits for OAuth and provider work;
- versioned AES-256-GCM envelopes for provider credentials;
- additive PostgreSQL persistence for focused Postiz core records and
  ClipStitchr tenant, secret, media, post-state, attempt, receipt, outbox,
  analytics, and audit sidecars;
- reconnect-safe OAuth integration metadata and advisory-locked credential
  rotation;
- all-or-nothing multi-account OAuth saves, serialized provider refresh, and
  atomic disconnect/revocation;
- idempotent draft, publish-now, and exact-schedule destination creation with
  bounded provider settings in the canonical request hash;
- recoverable outbox leasing, rescheduling, completion, and dead-lettering;
- structured logging that redacts credential-bearing fields and URL queries;
- fixed-origin Instagram, TikTok, and YouTube protocol adapters with injected transport,
  clock, and wait boundaries for deterministic tests;
- a closed Instagram, optional Instagram Standalone, TikTok, and YouTube registry;
- bounded Instagram container processing, resumable YouTube upload/analytics,
  and explicit TikTok accepted,
  processing, action-required, private-complete, published, and rejected
  outcomes;
- raw-body TikTok webhook signature verification;
- liveness and dependency-aware readiness reports plus HTTP request handling.

The browser must never call this service directly. ClipStitchr web routes
resolve the Clerk actor and active organization, derive the tenant identity,
and issue an action-specific assertion. The service independently verifies the
assertion and consumes its nonce before handling a request.

The compact assertion wire format and verifier requirements are documented in
[`docs/service-assertion-format.md`](docs/service-assertion-format.md).
OAuth state and rate-limit integration are documented in
[`docs/oauth-authorization-state.md`](docs/oauth-authorization-state.md) and
[`docs/rate-limits.md`](docs/rate-limits.md). The concrete Redis lifecycle and
disposable integration-test contract are documented in
[`docs/redis-runtime.md`](docs/redis-runtime.md).
The additive PostgreSQL schema, transaction invariants, tenant guards, provider
checkpoints, immutable receipts, exact schedule intent, and disposable
PostgreSQL 18 test contract are documented in
[`docs/postgresql-persistence.md`](docs/postgresql-persistence.md).

## Runtime ownership

The production runtime owns its Redis and Prisma clients, the PostgreSQL outbox
dispatcher, and the bounded HTTP server. Readiness registers a probe for every
required client. Redis provides
assertion replay protection, OAuth state storage, and atomic dual-scope rate
limits. The included in-memory replay implementation is not suitable for
multiple processes or production restarts.

The ioredis adapter supports `SET` with `NX` and `PX`, `GETDEL`, `GET` plus
`EVAL`, and `EVAL` for the dual-scope fixed-window limiter. The OAuth fallback
ships its compare-and-delete Lua script in this package. A plain `GET` followed
by a separate `DEL` is not an acceptable implementation. The adapter disables
offline command queueing and reconnect retries so protected operations fail
closed when Redis is not ready.

Every Redis security primitive requires the validated
`STUDIO_PUBLISHING_REDIS_NAMESPACE`. Use a distinct value such as
`clipstitchr-development`, `clipstitchr-staging`, or
`clipstitchr-production` for each deployment, even when deployments use
different Redis databases. The namespace comes only from deployment
configuration and is never accepted from a request.

Provider access and refresh tokens are encrypted before persistence. The token
encryption key is a dedicated 32-byte key and is intentionally represented by
a different type from the service-assertion signing key. Encryption context
binds a token to its tenant, provider, integration, and token kind so an
encrypted value cannot be moved to another record undetected.

## Environment contract

Production requires these names:

- `NODE_ENV=production`
- `STUDIO_BETA_ENABLED=true`
- `STUDIO_PUBLISHING_SERVICE_HOST`
- `STUDIO_PUBLISHING_SERVICE_PORT`
- `STUDIO_PUBLISHING_SERVICE_ISSUER`
- `STUDIO_PUBLISHING_SERVICE_AUDIENCE`
- `STUDIO_PUBLISHING_SERVICE_ASSERTION_KEY_BASE64`
- `STUDIO_PUBLISHING_DISPATCH_ACCESS_SECRET`
- `STUDIO_PUBLISHING_TOKEN_KEY_ID`
- `STUDIO_PUBLISHING_TOKEN_KEY_BASE64`
- `STUDIO_PUBLISHING_DATABASE_URL`
- `STUDIO_PUBLISHING_REDIS_URL`
- `STUDIO_PUBLISHING_REDIS_NAMESPACE`
- `STUDIO_PUBLISHING_APP_ORIGIN`
- `STUDIO_PUBLISHING_SERVICE_ORIGIN`
- `STUDIO_PUBLISHING_ENABLED_PROVIDERS`
- `STUDIO_PUBLISHING_META_GRAPH_API_VERSION` when either Instagram path is enabled

`STUDIO_PUBLISHING_ENABLED_PROVIDERS` is a comma-separated allowlist containing
only `instagram`, `instagram-standalone`, `tiktok`, and `youtube`. The current
production parser requires TikTok and at least one Instagram path; YouTube is
enabled independently. Credentials are required and parsed only for enabled
paths:

| Enabled path           | Required credentials                       |
| ---------------------- | ------------------------------------------ |
| `instagram`            | `STUDIO_PUBLISHING_META_APP_ID`, `STUDIO_PUBLISHING_META_APP_SECRET`   |
| `instagram-standalone` | `STUDIO_PUBLISHING_INSTAGRAM_APP_ID`, `STUDIO_PUBLISHING_INSTAGRAM_APP_SECRET` |
| `tiktok`               | `STUDIO_PUBLISHING_TIKTOK_CLIENT_ID`, `STUDIO_PUBLISHING_TIKTOK_CLIENT_SECRET` |
| `youtube`              | `STUDIO_PUBLISHING_GOOGLE_CLIENT_ID`, `STUDIO_PUBLISHING_GOOGLE_CLIENT_SECRET` |

`STUDIO_PUBLISHING_META_GRAPH_API_VERSION` must be an explicit version such as `v26.0`.
Aliases such as `latest` are rejected so a provider contract cannot change
silently between deploys.

Production requires HTTPS for `STUDIO_PUBLISHING_APP_ORIGIN`,
`STUDIO_PUBLISHING_MEDIA_PUBLIC_ORIGIN`, and
`STUDIO_PUBLISHING_TIKTOK_VERIFIED_MEDIA_ORIGIN`, plus `rediss:` for
`STUDIO_PUBLISHING_REDIS_URL`. Development and tests may use HTTP only on
`localhost`, `127.0.0.1`, or `[::1]`, and may use a local `redis:` connection.

TikTok also requires `STUDIO_PUBLISHING_TIKTOK_VERIFIED_MEDIA_ORIGIN`, an exact HTTPS origin
owned and verified in the TikTok app. Runtime assembly must pair that origin
with a media verifier that checks the immutable tenant-owned object and proves
the provider URL does not redirect before init.

Disabled provider credentials are ignored, and disabled provider adapters must
be rejected with `assertPublishingProviderEnabled` before any provider work.
The Studio target shape enables `instagram,tiktok,youtube`; standalone
Instagram credentials are not required unless that optional path is added to
the allowlist.

Both cryptographic values are standard base64 encodings of exactly 32 random
bytes and must be independently generated and stored in the deployment secret
manager. No secret value belongs in source, examples, logs, or browser output.
The dispatch-access secret is a third independent value shared only by this
service and the ClipStitchr web gateway. The service uses it for the bounded
internal access check immediately before each provider-capable workflow step.
`NODE_ENV` is required in every runtime. Development and test parsing permits
missing infrastructure so isolated unit tests can run, but any supplied value
is still validated. `STUDIO_BETA_ENABLED` is enabled only by the exact lowercase
value `true`; missing, differently cased, or padded values keep publishing off.
There are no insecure fallback keys.

## Health surfaces

`createPublishingServiceRequestHandler` exposes:

- `GET /healthz`: process liveness;
- `GET /readyz`: dependency readiness, returning `503` if any probe fails;
- all other paths: `404`.

Readiness includes the Studio Beta kill switch. When it is off, every route
except liveness and readiness returns `503` before assertion verification, rate
limits, request-body parsing, webhook work, or provider work begins. The outbox
loop also remains dormant and does not lease queued records while the switch is
off.

Before any active outbox record can advance a provider workflow, the service
posts only its persisted owner and Product identifiers to the fixed
`/api/studio/publishing/internal/dispatch-access` web route. That route checks
the shared secret, the web switch, and a secret-gated Convex mutation. Convex
reloads the global switch, current Studio grant and opt-in, owner/Product
relationship, and Product archive state. A denial or unavailable check
is rescheduled without reading provider credentials, issuing media grants,
writing a provider checkpoint, or calling a provider.

The integration layer must supply real PostgreSQL, Redis, and any other
required dependency probes. Register Redis through
`createPublishingRedisReadinessDependency`. A successful liveness response does
not mean the service is ready to accept publishing work.

## Provider adaptation boundary

Postiz-derived provider and workflow references live under the separate
`web/vendor/postiz` provenance boundary. The executable protocol adapters in
this package preserve the useful provider sequencing while correcting the
official contracts and keeping security decisions in ClipStitchr-owned code.
Vendor code must not parse Clerk cookies, choose a tenant, decrypt credentials,
write unscoped records, or issue assertions.

TikTok's confidential web flow intentionally has no PKCE fields or
`code_verifier`. Direct posting requires a current creator-info response and
explicit consent. Server-hosted media uses `PULL_FROM_URL`. An init response is
only `accepted`; `SEND_TO_USER_INBOX` is action-required and is never labeled
published. Instagram uses only the configured Meta Graph version and stops
polling at the documented bounded budget.

YouTube uses Google OAuth with PKCE S256 and offline access. Publishing writes
a durable resumable-upload checkpoint, probes the committed byte offset before
resuming, streams bounded 8 MiB chunks, and reconciles a lost response instead
of creating another upload. An optional thumbnail is applied only after the
video ID is durable. Google access is limited to the exact authorization,
token, channel, upload, thumbnail, and analytics hosts required by the workflow.

Production enablement still requires the documented additive database migration,
Cloud Run service deployment, verified provider callback/media domains, valid
Instagram, TikTok, and Google app credentials, provider review where required,
and an authorized test-account publish/status smoke for every enabled provider.
Implemented code alone is never a live-publish claim.

## Verification

From this directory, with the repository's dependencies installed:

```bash
npm run typecheck
npm test
npm run build
```

The service is an npm workspace of `web/`, and the repository keeps one lockfile
at `web/package-lock.json`. From `web/`, use:

```bash
npm run publishing-service:typecheck
npm run publishing-service:test
npm run publishing-service:build
```
