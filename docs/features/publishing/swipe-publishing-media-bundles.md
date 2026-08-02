# Swipe publishing media bundles

## Purpose

A saved Swipe is editable data plus a poster. Publishing a carousel needs every
final slide as durable media. This feature creates an owner-scoped bundle of all
3-8 rendered JPEG slides without treating the poster, a browser `blob:` URL, or
a temporary provider URL as the carousel.

The bundle is a preparation step for the publishing composer. It does not call a
social provider and does not publish anything by itself.

## Immutable revision identity

The browser first requests preparation for a saved Swipe. The server loads that
Swipe through an authenticated, owner-scoped Convex query and computes a SHA-256
editable-state digest from the fallback background, ordered slide IDs,
per-slide background choices, and every text-overlay field.

The server then HEADs every referenced background in R2. The final revision
hash includes:

- the editable-state digest;
- each sorted background's owner-scoped object key, exact byte size, content
  type, checksum, ETag, or version identity;
- the explicit renderer version;
- the 1080x1920 output dimensions; and
- the shared provider-safe `image/jpeg` output at canvas quality `0.92`.

The current renderer version is
`swipr-canvas-1080x1920-jpeg-q92-v1`. A background replacement, saved-edit
change, output-contract change, quality change, or renderer change therefore
creates a different revision. Caption, name, and timestamps are excluded because
they do not affect slide bytes.

## Durable object layout

Every key is checksum-addressed and remains beneath the authenticated owner and
Swipe record:

```text
users/{encoded-owner-id}/swipes/{sanitized-swipe-id}/publishing/
  {64-character-revision}/
    slide-01-{base64url-sha256}.jpg
    slide-02-{base64url-sha256}.jpg
    ...
    slide-08-{base64url-sha256}.jpg
```

The bundle records the ordered index, key, `image/jpeg`, exact byte size,
1080x1920 dimensions, base64 SHA-256 checksum, and optional R2 ETag or version
ID. It stores no signed URL and no local URL.

## Creation and commit flow

1. `POST /api/r2/swipe-publishing-upload-grants` authenticates the user, loads
   the current owner-scoped Swipe, consumes the user and global preparation
   limits, HEADs every saved background, and derives the full revision.
2. A structurally valid bundle with that exact full revision is returned as
   reusable. Reuse is a server decision, not a client assertion.
3. Otherwise the browser renders all ordered slides as 1080x1920 JPEG at quality
   `0.92` and calculates the SHA-256 of each complete blob.
4. The browser sends the ordered checksums and exact byte lengths back to the
   same preparation route. The server re-reads the Swipe and backgrounds and
   refuses a stale revision or changed slide count.
5. Convex stores a reserved upload attempt and consumes the complete 3-8 object
   count plus total bytes against per-user and shared global R2 limits before
   any PUT URL is signed.
6. The route returns all grants together. Each signature binds the deterministic
   checksum-addressed key, `Content-Type`, `Content-Length`,
   `x-amz-checksum-sha256`, and checksum metadata. `If-None-Match: *` prevents
   replacement of an existing immutable object. A concurrent creator may treat
   a precondition failure as success only because the key includes the exact
   checksum.
7. No PUT starts until the complete grant set exists. The browser also checks
   that each blob's actual size equals its signed size before upload.
8. After every PUT settles successfully, the browser calls
   `POST /api/r2/swipe-publishing-commit`. It cannot invoke the final Convex
   mutation directly because that mutation requires the server-only rate-limit
   secret.
9. The commit route reloads the authenticated attempt and HEADs every output.
   Every object must exist and match its owner/key prefix, JPEG content type,
   exact byte length, and signed SHA-256 checksum. A skipped upload, short
   object, wrong content type, or mismatched checksum prevents finalization.
10. Only after every HEAD passes does the server call the secret-gated Convex
    commit. Convex rechecks the current saved editable digest and exact bundle
    shape, updates the current Swipe/card, marks the attempt committed, and
    inserts the revision into immutable bundle history.
11. Every publish attempt re-resolves the persisted `{kind, recordId}` descriptor
    against the current owner-scoped Swipe revision. Provider registration HEADs
    the objects, and just-in-time signing HEADs them once more immediately before
    minting a fetch grant. A changed checksum/version is rejected and the exact
    verified identity is carried into the signer/gateway request.
12. The provider-readable gateway returns an opaque ClipStitchr URL. It streams
    only the bound R2 VersionId or ETag, supports GET, HEAD, and one byte range,
    and consumes per-grant plus shared request and byte quotas before R2 access.
    See `docs/features/publishing/provider-readable-media-gateway.md`.

## Failure, retention, and garbage collection

- A rejected reservation creates no PUT URLs and no objects.
- Uploads use `Promise.allSettled`; a failed or uncertain operation never deletes
  a checksum-addressed key inline. Immediate cleanup could race another creator,
  a commit whose response was lost, or a scheduled post using an older revision.
- Commit is idempotent. The client can reconcile the owner-scoped attempt and
  retry after a network failure without uploading again.
- Every committed revision remains in `swipePublishingBundleHistory`, even after
  a newer revision becomes current. Scheduled and published Postgres records may
  still reference the older immutable descriptor.
- There is currently no automatic minimum-age deletion. Reserved and historical
  objects remain retained until a future garbage collector can prove the key is
  absent from the current Convex bundle, Convex bundle history, live upload
  attempts, and every scheduled or published Postgres media-source reference.
  That cross-store proof and a documented retention window must ship before any
  deletion policy is enabled.

This favors storage safety over an unsafe best-effort delete. A future garbage
collector must be owner-scoped, rate-limited, restartable, and conservative when
either data store is unavailable.

## Abuse protection

The workflow rejects expensive work before it happens:

- preparation and commit verification each consume
  `swipePublishingPrepare`: 600/hour/user with burst 60, plus a shared
  20,000/hour bucket with burst 2,000 across five shards;
- the reservation consumes all slide grants together against 2,000 upload
  URLs/hour/user with burst 500 and 100,000/hour globally with burst 10,000;
- exact upload bytes consume 10 GB/day/user and 500 GB/30 days/user, plus
  1 TiB/day and 20 TiB/30 days globally;
- the reservation and final metadata write retain their existing Convex
  write limits; and
- ownership and immutable-object checks remain separate from rate limits.

See `docs/operations/security/rate-limits.md` for the enforcement map.

## R2 CORS requirements

The private bucket CORS rule for the app origin must allow `PUT` and these
request headers:

```text
Content-Type
If-None-Match
x-amz-checksum-sha256
x-amz-meta-checksum-sha256
```

The user agent supplies the signed `Content-Length` from the exact request body.
Exposing `ETag` and `x-amz-version-id` allows optional browser-side identity
capture. The SHA-256 identity remains mandatory even when those headers are not
exposed.

Cloudflare documents S3 `PutObject` SHA-256 support and base64 checksum values:

- https://developers.cloudflare.com/r2/api/s3/api/
- https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- https://developers.cloudflare.com/r2/api/error-codes/

## Relevant files

```text
web/app/api/r2/swipe-publishing-upload-grants/route.ts
web/app/api/r2/swipe-publishing-commit/route.ts
web/convex/schema.ts
web/convex/swipePublishingBundles/getPreparation.ts
web/convex/swipePublishingBundles/reserve.ts
web/convex/swipePublishingBundles/getAttempt.ts
web/convex/swipePublishingBundles/commit.ts
web/convex/publishingMedia/getOwnedPublishingSwipeRecord.ts
web/lib/clipstitchr/publishing/media/
  createDurableSwipePublishingBundle.ts
  createSwipePublishingRevision.ts
  createSwipePublishingSlideObjectKey.ts
  renderSwipePublishingSlideBlobs.ts
  swipePublishingOutputContract.ts
  uploadSwipePublishingSlideBlobs.ts
web/lib/clipstitchr/server/r2/getR2UploadSignedUrl.ts
```

## Supported use cases

- Prepare a newly saved Swipe before opening the publishing composer.
- Reuse an unchanged, server-verified Swipe bundle without rendering again.
- Regenerate all ordered media after a background, overlay, slide-order, quality,
  or renderer-contract change.
- Resolve one immutable 3-8 image carousel for Instagram or TikTok.

Rendered Swipe video publishing remains a separate capability.
