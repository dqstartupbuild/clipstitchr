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
- fixed-origin Instagram and TikTok protocol adapters with injected transport,
  clock, and wait boundaries for deterministic tests;
- a closed Instagram, optional Instagram Standalone, and TikTok registry;
- bounded Instagram container processing and explicit TikTok accepted,
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
`PUBLISHING_REDIS_NAMESPACE`. Use a distinct value such as
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
- `PUBLISHING_SERVICE_HOST`
- `PUBLISHING_SERVICE_PORT`
- `PUBLISHING_SERVICE_ISSUER`
- `PUBLISHING_SERVICE_AUDIENCE`
- `PUBLISHING_SERVICE_ASSERTION_KEY_BASE64`
- `PUBLISHING_TOKEN_KEY_ID`
- `PUBLISHING_TOKEN_KEY_BASE64`
- `DATABASE_URL`
- `REDIS_URL`
- `PUBLISHING_REDIS_NAMESPACE`
- `CLIPSTITCHR_PUBLIC_ORIGIN`
- `PUBLISHING_SERVICE_ORIGIN`
- `PUBLISHING_ENABLED_PROVIDERS`
- `META_GRAPH_API_VERSION` when either Instagram path is enabled

`PUBLISHING_ENABLED_PROVIDERS` is a comma-separated allowlist containing only
`instagram`, `instagram-standalone`, and `tiktok`. Production must enable
`tiktok` and at least one Instagram path. Credentials are required and parsed
only for enabled paths:

| Enabled path           | Required credentials                       |
| ---------------------- | ------------------------------------------ |
| `instagram`            | `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`   |
| `instagram-standalone` | `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET` |
| `tiktok`               | `TIKTOK_CLIENT_ID`, `TIKTOK_CLIENT_SECRET` |

`META_GRAPH_API_VERSION` must be an explicit version such as `v26.0`.
Aliases such as `latest` are rejected so a provider contract cannot change
silently between deploys.

TikTok also requires `TIKTOK_VERIFIED_MEDIA_ORIGIN`, an exact HTTPS origin
owned and verified in the TikTok app. Runtime assembly must pair that origin
with a media verifier that checks the immutable tenant-owned object and proves
the provider URL does not redirect before init.

Disabled provider credentials are ignored, and disabled provider adapters must
be rejected with `assertPublishingProviderEnabled` before any provider work.
The recovered deployment currently enables `instagram,tiktok`; standalone
Instagram credentials are not required for that shape.

Both cryptographic values are standard base64 encodings of exactly 32 random
bytes and must be independently generated and stored in the deployment secret
manager. No secret value belongs in source, examples, logs, or browser output.
`NODE_ENV` is required in every runtime. Development and test parsing permits
missing infrastructure so isolated unit tests can run, but any supplied value
is still validated. There are no insecure fallback keys.

## Health surfaces

`createPublishingServiceRequestHandler` exposes:

- `GET /healthz`: process liveness;
- `GET /readyz`: dependency readiness, returning `503` if any probe fails;
- all other paths: `404`.

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

Production enablement still requires the documented additive database migration,
Cloud Run service deployment, verified provider callback/media domains, valid
Instagram and TikTok app credentials, provider review where required, and an
authorized test-account publish/status smoke. Implemented code alone is never a
live-publish claim.

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
