# Postiz and ClipStitchr publishing comparison

## Scope

This is a source and Git-history audit only. It compares Instagram, TikTok,
and YouTube provider contracts, OAuth ownership, scheduling and outbox
behavior, analytics, security boundaries, and coexistence risks. It does not
activate Postiz, change the current Zernio integration, or prescribe a cutover.

## Audited revisions

| Revision | Role | Factual boundary |
| --- | --- | --- |
| Postiz `013db1dac7936054e77d40dd027ede0222771945` | Current official `main` head observed and fetched on 2026-08-12 | Complete 929-file Git tree in `upstream/`; tree object `817291b58d173470f330910f059d7ea26b97f0e1` |
| ClipStitchr `9af6be8536860149f9dc9ea5b5d9a6f1f50cd977` | Original direct Postiz integration | Imported a focused 181-file Postiz boundary from upstream `cf4c432c00c9db775ea1b1f12480a8e2b89aec32` and added a 654-file publishing service |
| ClipStitchr `4968c167b28a20cff6c95ebf4e6f62bc18681607` | Revert of the direct integration | Removed the 1,244-file change and restored the existing Post Bridge product integration |
| ClipStitchr `bd0a2ce4b6c0264eab338d3be72b68790d1fb5ea` | Zernio replacement | Replaced Post Bridge routes and adapters with the provider-neutral `socialPublishing` boundary backed by Zernio |
| ClipStitchr `ce362a5e03f6a81c042095dc65743b8cc6224537` | Current committed tree at audit time | Keeps Zernio behind `/api/social-publishing/**`; no active Postiz runtime or direct platform OAuth |

The current-tree comparison uses committed `HEAD` for any file with unrelated
working-tree changes. No history commit was checked out, cherry-picked, or
executed.

## Architecture matrix

| Area | Official Postiz `013db1da` | Original ClipStitchr Postiz `9af6be85` | Revert `4968c167` | Zernio replacement `bd0a2ce` | Current ClipStitchr `ce362a5` |
| --- | --- | --- | --- | --- | --- |
| Provider contracts | Native providers for Instagram Facebook Business, Instagram Standalone, TikTok, and YouTube. Each provider owns validation, API requests, status reconciliation, and analytics. | Closed registry contained only `instagram`, `instagram-standalone`, and `tiktok`; YouTube was not imported. ClipStitchr adapters wrapped the retained source. | Direct Postiz providers were removed. Existing Post Bridge supported TikTok, Instagram, and YouTube through its API. | Preserved those three product platforms while replacing Post Bridge calls and numeric account IDs with Zernio contracts and string account IDs. | TikTok, Instagram, and YouTube remain the only supported product platforms. The current adapter sends a generic account/content/media contract, TikTok settings, and a YouTube title. |
| OAuth and connection ownership | Postiz performs Meta, Instagram, TikTok, and Google OAuth itself. Provider classes generate short state values with `makeId` or, for TikTok, `Math.random`; provider access and refresh tokens are Postiz records. | ClipStitchr owned direct provider OAuth behind its publishing service. The historical audit required tenant-bound, single-use state, service assertions, and encrypted token envelopes instead of exposing raw provider classes. | ClipStitchr did not own platform OAuth. A user supplied a Post Bridge API key and managed connected networks through Post Bridge. | Connection ownership moved to Zernio. ClipStitchr stores a Zernio API key and reads Zernio accounts; network OAuth stays outside ClipStitchr. | Same Zernio model. The app reports account `needsReconnection` but does not hold Instagram, TikTok, or Google OAuth tokens. |
| Scheduling and outbox | Prisma post state plus Temporal workflow `postWorkflowV106`. Read-only status checks retry; irreversible `postSocialPending` and `finalizePost` activities have one automatic attempt. Durable timers and provider checkpoints resume pending uploads. | Separate PostgreSQL/Redis/Temporal service with tenant-scoped destinations, attempts, receipts, leases, retries, dead letters, and a transactional outbox contract. | Scheduling returned to Post Bridge's remote `use_queue` or `scheduled_at` API contract. The reverted direct service and its local outbox were removed. | Scheduling became Zernio `queuedFromProfile`, `scheduledFor`, or `publishNow`; Zernio is the remote scheduler. | The route rate-limits, validates owned media, calls Zernio, then writes a Convex post reference. This is a sequential remote-call/local-write flow, not the historical transactional outbox. `x-request-id` is generated for the Zernio create call and `existingPost` is accepted. |
| Analytics | Each of the three native provider implementations has account and post analytics methods; the Postiz backend/UI aggregates them. | Retained Instagram and TikTok analytics source and added tenant-scoped analytics snapshots and audit events. No YouTube adapter existed. | Post Bridge supplied normalized analytics for its three platforms. | Replaced Post Bridge analytics with Zernio analytics and generic product mappings. | Reads `/v1/analytics`, flattens per-platform targets, and normalizes views, likes, comments, shares, duration, timestamps, and URLs. It limits the query to the last year and uses a 60-minute freshness policy. |
| Security boundary | Current source includes an SSRF-safe dispatcher for user-influenced media, bounded error serialization, and safer mutation retry rules. Prisma still models `Integration.token` and `refreshToken` as strings, and integration-bearing activity results/arguments require a Temporal-history credential review. | Historical ClipStitchr wrappers added Clerk tenancy, authenticated service assertions with replay protection, encrypted credentials, fixed-origin transport, redirect/size limits, media ownership checks, rate limits, and durable reconciliation. | Clerk ownership, encrypted Post Bridge API-key storage, and local/provider rate limits remained, while raw platform credentials stayed outside ClipStitchr. | Carried those controls into the generic Zernio boundary. | Zernio API keys are owner-scoped and AES-256-GCM encrypted, with only the last four characters exposed. Routes require Clerk/Convex auth and apply per-user/global limits plus a per-key provider-request limiter. Provider error strings can reach the client and remain a review point for any multi-provider boundary. |
| Coexistence risk | Postiz identifiers, Prisma records, OAuth callbacks, Temporal workflows, and provider post IDs belong to a separate runtime model. They are not interchangeable with Zernio IDs. | Historical routes were `/api/publishing/**` with their own service/database model. Reusing this reverted implementation would also reuse an older Postiz baseline and omit YouTube. | Legacy `postBridge*` fields and tables remained for compatibility after the revert. They are historical data, not a namespace for new Postiz records. | The replacement introduced generic `socialPublishing*` fields and routes but stores Zernio account/post IDs without a provider discriminator. | A side-by-side Postiz experiment must not write Postiz IDs into `socialPublishingPosts`, `socialPublishingPostProductMappings`, or product `socialPublishingSocialAccountIds`. Those locations currently mean Zernio. Separate provider-qualified storage, routes, callbacks, idempotency keys, and analytics mappings are required before coexistence can be evaluated safely. |

## Provider contract matrix

| Provider | Official Postiz `013db1da` | Original ClipStitchr Postiz `9af6be85` | Current Zernio-backed ClipStitchr |
| --- | --- | --- | --- |
| Instagram | Two login modes. Supports single media, reels, stories, up-to-10-item carousels, trial reels, graduation strategy, collaborators, audio configuration, container polling/finalization, and provider analytics. | Imported both Instagram identifiers and audited Graph container lifecycle, public media constraints, consent/scopes, rolling publish limits, and reconciliation. | Selects Zernio Instagram accounts and sends caption/media through the generic platform contract. No Instagram-specific story, trial-reel, collaborator, audio, or login-mode option is exposed by the current helper. |
| TikTok | Supports one video or one/many photos. Explicitly distinguishes `DIRECT_POST` from `UPLOAD` to the user's TikTok inbox. Includes privacy, comment, duet, stitch, commercial-content, AI-label, photo-music, creator-info, chunked upload, pending `publish_id` status, and analytics. | Imported TikTok and added explicit direct-versus-inbox semantics, creator-info validation, verified pull URLs, webhook verification, status reconciliation, and provider checkpoints. | Fetches Zernio creator info and sends consent, privacy, commercial-content, comment, duet, stitch, and photo auto-music settings. It has no direct-versus-inbox selector in the current product contract. |
| YouTube | Native Google OAuth provider. Supports one video, resumable chunked upload/status probing, title, public/private/unlisted visibility, made-for-kids, tags, thumbnail, account analytics, and post analytics. | Not present in the focused provider registry or composer contract. | Supported through Zernio. Current platform-specific configuration supplies only `title`; OAuth, upload checkpoints, visibility, made-for-kids, tags, and thumbnail behavior are delegated to or constrained by Zernio rather than represented in the ClipStitchr helper. |

## Evidence anchors

Official Postiz source:

- Instagram provider: `upstream/libraries/nestjs-libraries/src/integrations/social/instagram.provider.ts`
- Instagram Standalone provider: `upstream/libraries/nestjs-libraries/src/integrations/social/instagram.standalone.provider.ts`
- TikTok provider: `upstream/libraries/nestjs-libraries/src/integrations/social/tiktok.provider.ts`
- YouTube provider: `upstream/libraries/nestjs-libraries/src/integrations/social/youtube.provider.ts`
- Provider settings: `upstream/libraries/nestjs-libraries/src/dtos/posts/providers-settings/`
- Current workflow: `upstream/apps/orchestrator/src/workflows/post-workflows/post.workflow.v1.0.6.ts`
- Integration persistence: `upstream/libraries/nestjs-libraries/src/database/prisma/schema.prisma`
- Media transport boundary: `upstream/libraries/nestjs-libraries/src/integrations/social.abstract.ts`

Current ClipStitchr source:

- Platform allowlist: `web/lib/clipstitchr/server/socialPublishing/socialPublishingSupportedPlatforms.ts`
- Zernio request boundary: `web/lib/clipstitchr/server/socialPublishing/requestSocialPublishing.ts`
- Post creation: `web/lib/clipstitchr/server/socialPublishing/createSocialPublishingPost.ts`
- Per-platform configuration: `web/lib/clipstitchr/server/socialPublishing/createSocialPublishingPlatformConfigurations.ts`
- TikTok creator info: `web/lib/clipstitchr/server/socialPublishing/getSocialPublishingTikTokCreatorInfo.ts`
- Posts and analytics: `web/lib/clipstitchr/server/socialPublishing/listSocialPublishingPosts.ts` and `listSocialPublishingAnalytics.ts`
- Authenticated schedule route: `web/app/api/social-publishing/schedule/route.ts`
- Encrypted settings: `web/convex/socialPublishingSettings.ts`
- Product mappings: `web/convex/socialPublishingPostProductMappings.ts`
- Persistent compatibility fields: `web/convex/schema.ts`

History was inspected without changing the checkout using these read-only
forms:

```text
git show 9af6be85:<path>
git show 4968c167:<path>
git show bd0a2ce:<path>
git show ce362a5:<path>
git diff-tree --no-commit-id --name-only -r <commit>
git ls-tree -r --name-only <commit> <path>
```

## Integration findings

1. The reverted `9af6be85` change is not a safe cherry-pick candidate. It is a
   large service integration against older Postiz commit `cf4c432c`, includes
   no YouTube provider, and was explicitly removed by `4968c167`.
2. The current official Postiz source has materially stronger pending-post and
   duplicate-avoidance behavior than the older imported baseline, including
   provider checkpoints and one-attempt mutation activities. It still assumes
   Postiz's own Prisma, Temporal, OAuth, and organization model.
3. Current ClipStitchr delegates platform OAuth, scheduling, and most provider
   protocol work to Zernio. Direct Postiz operation would introduce a second
   credential owner and scheduler, not merely another HTTP adapter.
4. Current `socialPublishing*` names are provider-neutral in spelling but
   Zernio-specific in stored identity. Postiz and Zernio account IDs, post IDs,
   status values, idempotency receipts, and analytics keys must never share
   those records without an explicit provider discriminator and migration.
5. Current post listing requests Zernio source `zernio`, while current
   analytics listing requests source `late`. This may be an intentional Zernio
   compatibility alias, but its semantics must be confirmed before analytics
   or reconciliation is shared with another provider.
6. The current scheduling sequence can leave a remote Zernio post without its
   local Convex reference if the provider call succeeds and the following
   mutation fails. The historical Postiz service addressed that class through
   a transactional outbox; official Postiz addresses different failure modes
   through Prisma state plus Temporal checkpoints. These are distinct delivery
   guarantees and cannot be merged by reusing names.
7. The least risky source-acquisition conclusion is to keep current Zernio
   routes and records unchanged and treat this immutable Postiz tree as
   reference input until a separately namespaced, credential-safe, provider-
   qualified design is reviewed. This report does not implement that design.
