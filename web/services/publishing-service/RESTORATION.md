# Studio publishing service restoration

## Source boundary

This service was restored literally from the ClipStitchr Git history before it
was adapted for the opt-in Studio workspace.

- Source commit: `9af6be8536860149f9dc9ea5b5d9a6f1f50cd977`
- Source subtree: `web/services/publishing-service`
- Source Git tree: `f40f72e995386dc2ef6a6a6f1d0bb076e084851e`
- Source file count: 654 Git-visible files
- Restoration method: `git archive` of that exact subtree, without checking
  out or cherry-picking the historical commit

The restored baseline includes PostgreSQL persistence, Redis security
primitives, OAuth state, encrypted provider-token envelopes, the durable
outbox, recoverable leases, immutable receipts, media grants, Instagram and
TikTok adapters, HTTP routes, and focused tests.

## Studio adaptation

The active copy is intentionally allowed to differ from the historical tree.
Changes after restoration are reviewed implementation work, not an attempt to
present the directory as an immutable snapshot. The immutable official Postiz
source remains separately pinned under
`web/vendor/postiz/official_013db1da/upstream`.

The Studio adaptation:

- uses only `STUDIO_PUBLISHING_*` deployment configuration;
- uses only `/api/studio/publishing/*` and
  `/dashboard/studio/publishing/*` public paths;
- adds current YouTube provider behavior from official Postiz commit
  `013db1dac7936054e77d40dd027ede0222771945`;
- requires a gateway-validated `productId` for every new post and scopes post
  create, list, detail, cancel, retry, calendar, analytics, and analytics
  refresh operations to both the tenant and that Product;
- keeps publishing connections tenant-wide so one authorized connection can be
  selected from multiple owned Products without duplicating provider tokens;
- accepts durable `studio-clip-output` and `studio-stitch-output` media sources
  in addition to the restored Library, Stitch, and Swipe sources;
- repairs the missing Prisma API-store assembly and stale generated-status
  branches found by the restored strict TypeScript gate;
- remains separate from every existing Zernio route, credential, identifier,
  schedule, post, analytics record, and user setting.

No source in this directory is executed merely by importing the immutable
vendor snapshot. The publishing service is an explicit workspace with its own
build and runtime entrypoint.

## YouTube provider slice

The service implementation is grounded in these pinned official files:

- `libraries/nestjs-libraries/src/integrations/social/youtube.provider.ts`;
- `libraries/nestjs-libraries/src/dtos/posts/providers-settings/youtube.settings.dto.ts`.

It preserves the official YouTube settings while tightening the service
boundary. A YouTube destination requires one MP4 video, a title from 2 through
100 characters, an optional description up to 5,000 characters, one of
`public`, `private`, or `unlisted`, an explicit made-for-kids choice, and tags
whose combined characters plus two extra characters for each tag containing
whitespace do not exceed 500. An optional durable thumbnail manifest must
resolve to one JPEG or PNG object no larger than 2 MiB.

Google authorization uses a random, provider-bound, single-use Redis state,
PKCE S256, offline access, and refresh-token storage through the existing
encrypted token envelope. The browser authorization host is
`accounts.google.com`. Server transport is restricted to the exact Google API
origins required for tokens, channel identity, uploads, thumbnails, and
analytics. Redirects are rejected and tokens, authorization codes, PKCE
verifiers, and resumable session URIs are not returned through public DTOs or
logs.

Publishing uses YouTube's resumable protocol. The durable workflow checkpoint
records the validated session URI, total byte size, committed offset, optional
video ID, and thumbnail state. Every resume probes the provider before sending
another range. Media is streamed in bounded 8 MiB chunks from a signed,
range-safe gateway grant and is never assembled as one in-memory body. A lost
session-creation response becomes `outcome_unknown`; it is never replaced with
a blind second upload. A completed upload produces the observable receipt
`https://www.youtube.com/watch?v=<video-id>`.

The enabled YouTube runtime requires:

```text
STUDIO_PUBLISHING_GOOGLE_CLIENT_ID
STUDIO_PUBLISHING_GOOGLE_CLIENT_SECRET
```

## Product-scoped ledger migration

Migration `20260812140000_add_youtube_product_scope` adds YouTube provider and
operation enum values, the two Studio output source kinds, and a nullable
`ClipPublishingPostState.productId`. The database column remains nullable so
existing restored rows can migrate safely. Application creation requires a
non-empty Product ID, and all new post lookups fail closed on null or a
different Product. Product ID participates in the canonical request hash,
workflow ID, outbox payload, audit metadata, idempotency uniqueness, and the
tenant/Product/state index.

## Service API contract

- `POST /v1/posts` requires `productId` in the JSON body.
- `GET /v1/posts`, `GET /v1/posts/:postId`, calendar, and analytics require
  `productId` in the query.
- Cancel and retry require `{ "productId": "..." }`.
- Analytics refresh requires `{ "productId": "...", "postId": "..." }`.
- A post ID belonging to another Product returns the same resource-not-found
  boundary as an unknown post.
- Compatibility checks and publishing connections remain tenant-scoped and do
  not accept a Product ID.

The exported TypeScript contract includes `PublishingApiYouTubeSettings`,
`PublishingApiYouTubeVisibility`, the expanded `PublishingApiMediaKind`, and
Product-aware post summary, detail, and analytics DTOs.

## Verification

Run from `web/services/publishing-service`:

```bash
npm run prisma:generate
npm run typecheck
npm test
npm run build
```

The PostgreSQL and Redis suites require their documented disposable local test
targets and explicit safety acknowledgements. Provider tests use fakes only;
verification does not call Google or upload media.
