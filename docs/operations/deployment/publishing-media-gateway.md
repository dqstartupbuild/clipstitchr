# Publishing media gateway deployment

## Launch state

The code path is implemented but must remain disabled for live publishing until
every check below passes. This document does not record a deployment, DNS
change, or live provider result.

## Required runtime values

Set these only in the Node.js runtime that serves the Next.js route:

```text
PUBLISHING_MEDIA_PUBLIC_ORIGIN=https://media.your-verified-clipstitchr-domain.example
PUBLISHING_MEDIA_TOKEN_SECRET=<at least 32 random bytes>
PUBLISHING_MEDIA_QUOTA_SECRET=<a different value with at least 32 random bytes>
RATE_LIMIT_API_SECRET=<same value configured in the matching Convex deployment>
R2_ENDPOINT=<private R2 S3 endpoint>
R2_BUCKET=<bucket name>
R2_ACCESS_KEY_ID=<server credential>
R2_SECRET_ACCESS_KEY=<server credential>
CONVEX_URL=<matching cloud Convex URL>
```

`PUBLISHING_MEDIA_PUBLIC_ORIGIN` must be one exact HTTPS origin with no path,
query, fragment, credentials, wildcard, preview hostname, or trailing routing
prefix. The URL minted for providers is that origin plus
`/api/publishing/media/{token}`. Configure the same origin as the provider-owned
or verified URL origin required by the active TikTok application.

Store both publishing-media secrets in the deployment secret manager. Do not
reuse provider OAuth secrets, Clerk secrets, R2 credentials, or
`RATE_LIMIT_API_SECRET`. Rotating the token secret invalidates outstanding fetch
grants. Drain or explicitly reconcile in-flight provider transfers first, and
confirm the scheduler can mint fresh grants for every retry and pending attempt.

## Convex setup

Deploy the updated rate-limit definitions and `consumePublishingMediaRead`
mutation to the matching Convex environment before routing traffic. The
mutation is public only at the transport layer and requires the shared
server-only `RATE_LIMIT_API_SECRET` before it touches any bucket.

Run codegen against development first:

```bash
cd web
npx convex dev --once
```

Do not point a production Next.js gateway at development Convex or the reverse.

## R2 requirements

- Keep the bucket private.
- The object HEAD response must include an ETag or VersionId.
- The runtime credential needs only `HeadObject` and `GetObject` for the media
  keyspace.
- Do not put a public R2 hostname or a presigned R2 URL in provider payloads.
- Confirm `If-Match`, VersionId GET, HEAD, and byte ranges against the production
  bucket before launch.

The gateway itself streams the object, so R2 CORS does not grant provider
access. Browser upload CORS remains a separate configuration.

## Pre-production checks

1. Use a non-production bucket and Convex deployment.
2. Mint a grant from an authenticated, owner-scoped saved media descriptor.
3. Confirm the URL origin exactly matches the configured origin.
4. Confirm the token text contains no key, owner ID, tenant ID, or file name.
5. Run `HEAD`, complete `GET`, `bytes=0-1023`, an open-ended range, and a suffix
   range. Confirm there is never a `Location` header.
6. Confirm a multi-range and an out-of-bounds range return `416` without an R2
   read.
7. Replace a test object and confirm the old ETag grant returns `410`. When R2
   versioning is active, also confirm the grant reads only its exact VersionId.
8. Exhaust a test grant's request and byte buckets. Confirm `429` and
   `Retry-After` arrive before an R2 command.
9. Verify application, proxy, CDN, and R2 logs omit tokens, object keys, query
   strings, Authorization values, and upstream storage URLs.
10. Load-test the largest supported media and longest expected provider fetch
    against the chosen Node hosting plan. Confirm function duration, streaming,
    bandwidth, and response-size limits do not truncate the body.
11. From a network outside the deployment, repeat GET, HEAD, and Range with
    redirects disabled.
12. Run one provider sandbox transfer. A successful local fetch alone is not a
    live publishing result.

## Production gate

Enable TikTok URL-pull or Instagram provider fetch only after:

- DNS and TLS are stable for the exact origin;
- the TikTok application recognizes the domain or URL prefix as verified;
- the production Convex limiter is deployed and reachable;
- production R2 identity preconditions pass;
- token and quota secrets are present and distinct;
- host logs are redacted;
- maximum-size streaming succeeds without buffering or truncation;
- a real provider sandbox fetch succeeds; and
- rollback can disable new publishing attempts without deleting scheduled
  media or Post Bridge history.

No part of this runbook authorizes deleting or migrating existing Post Bridge
jobs.
