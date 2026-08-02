# Provider-readable media gateway

## Purpose

Instagram and TikTok need to fetch media while a publish attempt is running.
ClipStitchr keeps R2 private, so providers receive a short-lived ClipStitchr URL
instead of an R2 key or presigned R2 URL.

The gateway serves media only. It does not authorize a user, choose a saved
asset, create a post, or call a social provider. Those decisions happen before
the server-side signer is invoked.

## Grant creation

The publish activity resolves an authenticated, owner-scoped media descriptor.
It then creates a non-sensitive quota identity with
`createPublishingMediaQuotaIdentityFromEnvironment`. The value is an HMAC
digest of the Clerk publishing tenant key. Raw user IDs, organization IDs, and
emails never enter the quota identity or rate-limit key. The encrypted grant
still carries the exact owner-scoped R2 key needed for its one read, but that key
is not visible in the URL.

Immediately before provider dispatch, the activity calls
`signPublishingMediaJustInTime` with:

- the resolved media source;
- the provider;
- the quota identity; and
- `createPublishingMediaUrlSignerFromEnvironment()`.

Both the just-in-time boundary and the concrete signer HEAD the R2 object. The
concrete signer refuses to mint when byte length, content type, checksum,
VersionId, or ETag changed after resolution. R2 must provide a VersionId or an
ETag so the read can be pinned to exact bytes.

There is no browser or public URL-minting endpoint. A client cannot submit an
R2 key for signing.

## Opaque token

The URL has this shape:

```text
{PUBLISHING_MEDIA_PUBLIC_ORIGIN}/api/publishing/media/{opaque-v1-token}
```

The v1 token is AES-256-GCM ciphertext with a separate SHA-256 HMAC over its
version and ciphertext envelope. HMAC comparison uses constant-time byte
comparison. Encryption and HMAC keys are domain-separated from the one
server-only token secret.

The encrypted claims bind:

- the exact configured HTTPS audience origin;
- object key;
- R2 VersionId and/or ETag plus available SHA-256 checksum;
- content type and exact byte length;
- Instagram or TikTok;
- issue and expiry times;
- one random per-grant quota key; and
- the non-sensitive tenant quota identity.

The object key and claims are not readable from the URL. The token, key, R2 URL,
and presigned URL must never be logged or persisted. Scheduled work persists the
media descriptor and immutable identity, then mints a new grant immediately
before each provider attempt.

## Provider reads

The public route accepts only `GET` and `HEAD` at the exact configured origin.
It never redirects and never returns a presigned R2 URL. A foreign host, invalid
token, wrong audience, oversized token, schema mismatch, signature tamper, or
expired grant fails before R2 access.

One RFC-style byte range is supported. Open-ended and suffix ranges are
normalized to one exact range. Invalid, unsatisfiable, or multi-range requests
return `416` with `Content-Range: bytes */{size}`. Valid ranges return `206` and
the exact `Content-Range` and `Content-Length`.

For every R2 read, the gateway supplies the token's VersionId when available
and its ETag as `If-Match`. It checks the returned length, type, VersionId, ETag,
and range before creating the response. A replacement or failed precondition
returns `410`; changed bytes are not streamed.

Responses include `Accept-Ranges: bytes`, `X-Content-Type-Options: nosniff`, a
cross-origin resource policy suitable for provider fetches, and private
`no-store` caching. They contain no object key or storage URL.

## Abuse protection

Every valid grant request consumes durable Convex quota before R2 access.
Invalid ranges also consume request quota before their `416` response.

- Per grant: 600 requests/hour, burst 120.
- Per publishing tenant: 5,000 requests/hour, burst 1,000.
- Shared global: 100,000 requests/hour, burst 10,000 across ten shards.
- Per grant: 10 GiB/day.
- Per publishing tenant: 50 GiB/day.
- Shared global: 10 TiB/day across ten shards.

`HEAD` consumes request quota and zero byte quota. `GET` consumes the exact full
or selected range length. A denied Convex bucket returns `429` with
`Retry-After`; a rate-limit dependency failure returns `503` before R2 access.

Rate limiting does not replace the Clerk tenant and media ownership checks that
must complete before the signer is reachable.

## File tree

```text
web/lib/clipstitchr/publishing/media/gateway/
  createPublishingMediaQuotaIdentity.ts
  createPublishingMediaQuotaIdentityFromEnvironment.ts
  createPublishingMediaUrlSigner.ts
  createPublishingMediaUrlSignerFromEnvironment.ts
  sealPublishingMediaGatewayToken.ts
  verifyPublishingMediaGatewayToken.ts
  servePublishingMediaGatewayRequest.ts
web/app/api/publishing/media/[token]/route.ts
web/convex/rateLimits/consumePublishingMediaReadLimits.ts
web/convex/rateLimits.ts
web/convex/rateLimiter.ts
```

## Supported use cases

- TikTok `PULL_FROM_URL` video transfer from a verified ClipStitchr domain.
- Instagram server-side media fetches without making the R2 bucket public.
- Complete GET, metadata HEAD, and a single byte-range read.
- A fresh grant for an idempotent retry without storing the prior URL.

Multipart ranges, browser key signing, directory reads, redirects, public R2
URLs, and durable fetch-token storage are intentionally unsupported.

## Verification

Deterministic tests cover encryption round trips, opacity, tampering, expiry,
foreign audiences, overwrite races, exact R2 conditions, GET, HEAD, range,
multi-range rejection, rate denial, and the absence of redirects. The deployment
runbook adds real public-origin and provider-visible checks.
