# Publishing media bridge foundation

This directory defines the ClipStitchr-owned boundary between saved media and
the publishing service. It does not query Convex, sign R2 URLs, call Instagram
or TikTok, or persist publishing records. The functions are deliberately pure
apart from the injected just-in-time signer.

## Supported source descriptors

The browser may send only this bounded descriptor:

```ts
type PublishingMediaSourceDescriptor = {
  kind: "stitch" | "swipe" | "library-media";
  recordId: string;
};
```

Raw R2 keys, HTTP URLs, signed URLs, browser `blob:` URLs, and extra fields are
rejected. An object ID is never treated as authorization.

The current object-key mapping is:

- `stitch` -> `users/{owner}/stitches/{record}/...`
- `swipe` -> `users/{owner}/swipes/{record}/...`
- `library-media` -> `users/{owner}/video-clips/{record}/...`

## Expected server wiring

1. A Clerk-protected route resolves the authenticated actor and effective
   publishing tenant. The browser must not choose either value.
2. Server code parses the descriptor and calls
   `api.publishingMedia.getOwnedPublishingMediaRecord.get` with an authenticated
   Convex client. The query derives `ownerId` from Convex auth and uses the
   `by_owner_id` index. It does not accept a browser owner or tenant value.
3. The query translates only the selected Stitch, current full Swipe publishing
   bundle, or video-library record into the durable source shape. It uses object
   references from that record and never a key copied from the request. A Swipe
   poster is never treated as a carousel.
4. `enrichPublishingMediaRecordWithR2Head` performs an R2 `HeadObject` before
   registration. It confirms that each object exists, its exact byte length and
   content type match Convex, and records its version, ETag, or SHA-256 checksum.
   Swipe bundles also carry the SHA-256 checksum that was bound into the signed
   upload request. HEAD must match that saved checksum before publishing.
5. `resolveOwnedPublishingMediaSource` checks owner equality, descriptor
   equality, the expected owner and record key prefix, durable media bounds,
   and immutable identity metadata.
6. `createPublishingMediaDeduplicationKey` hashes the publishing tenant, source
   kind, record ID, ordered object keys, versions, and checksums. Persist this
   key and the durable object identity, not a signed URL.
7. `inspectPublishingMediaCompatibility` reports common metadata problems for
   Instagram and TikTok. A clean report means only that the local metadata is
   ready. Provider acceptance, account capabilities, post mode, moderation,
   and current API rules still decide the real result.
8. Immediately before every publish attempt,
   `resolvePublishingMediaSourceForServer` re-resolves the persisted descriptor
   against the current owner-scoped Convex record. For a Swipe, that means the
   current saved revision and full bundle, never a media manifest cached when
   the post was scheduled. It then performs R2 HEAD enrichment and final
   owner/key resolution without creating or returning a URL.
9. A Temporal publish activity calls `signPublishingMediaJustInTime`
   immediately before provider upload or fetch. TikTok requests 4,500 seconds
   and rejects any grant with less than 4,200 seconds remaining, leaving more
   than its one-hour pull window after dispatch overhead. TikTok also requires
   one no-redirect URL whose origin exactly matches the server-configured,
   verified ClipStitchr HTTPS origin and supports GET, HEAD, and byte-range
   reads. Immediately before asking the signer, this function HEADs every object
   again, rejects a changed checksum/version, and passes the verified checksum
   and version into the sign request so the gateway can bind the fetch grant to
   those exact bytes.
10. Treat returned fetch grants as ephemeral secrets. Do not write them to
   PostgreSQL, Convex, Temporal workflow input or history, analytics, audit
   payloads, errors, or logs. Pass diagnostics through
   `redactPublishingMediaDiagnosticData`.

Authorization and rate limits remain separate. The route must check tenant
membership and media ownership before registration, URL signing, provider
work, or other cost. The publishing media registration and URL-minting limits
must be documented in `docs/operations/security/rate-limits.md` when routes are
added.

The concrete signer and no-redirect fetch route are implemented under
`gateway/`. The public route is
`{PUBLISHING_MEDIA_PUBLIC_ORIGIN}/api/publishing/media/{opaque-token}`. It binds
the exact object identity into an encrypted, HMAC-protected grant and streams
R2 with VersionId and/or `If-Match`. See
`docs/features/publishing/provider-readable-media-gateway.md` and
`docs/operations/deployment/publishing-media-gateway.md`.

## Saved Swipe bundles

`createDurableSwipePublishingBundle` starts with a server preparation request.
The server HEADs every saved background and derives a SHA-256 revision from its
immutable identity, the ordered editable slide state, the explicit renderer
version, and the 1080x1920 JPEG quality-0.92 output contract. It reuses only a
server-validated matching bundle; otherwise the browser renders all 3-8 JPEGs
and calculates each byte checksum.

Convex reserves the full attempt and per-user plus global upload quota before
any signature is returned. Every checksum-addressed conditional PUT is bound to
its content type, content length, and checksum. The authenticated commit route
then HEAD-verifies that every output exists with the exact bytes and checksum
before calling the server-secret Convex finalizer. Failed and uncertain attempts
are not deleted inline. Old revisions and reserved immutable objects remain for
deferred cross-store garbage collection so a concurrent commit or scheduled
Postgres post cannot lose its media. Browser `blob:` URLs and signed URLs are
never persisted.

The complete implementation and deployment contract is documented in
`docs/features/publishing/swipe-publishing-media-bundles.md`.

## Integration gaps

- Inspect codecs and dimensions server-side when existing metadata is absent.
- Deploy and provider-verify the exact ClipStitchr gateway origin, then complete
  the real public-network and maximum-size checks in the deployment runbook.
  Implementation alone does not make TikTok URL pull live.
- Apply provider account capability data, especially TikTok's account-specific
  duration limit, immediately before publishing.
- Add route-level authorization, per-tenant and global rate limits, audit
  events, and idempotent persistence around this foundation.
