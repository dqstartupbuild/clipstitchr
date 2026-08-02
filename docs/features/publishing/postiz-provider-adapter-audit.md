# Postiz Provider Adapter Audit

Audit date: 2026-08-02

Upstream source: `gitroomhq/postiz-app` at
`cf4c432c00c9db775ea1b1f12480a8e2b89aec32`

Retained providers: Instagram with Facebook Login, Instagram with Instagram
Login (`instagram-standalone`), and TikTok.

## Decision

The retained provider classes are valuable protocol references, but no retained
network method is safe to expose directly to ClipStitchr. Keep the imported
source traceable under `web/vendor/postiz/`, then put a ClipStitchr-owned adapter
in front of it. The adapter must own OAuth state, callback selection, encrypted
credentials, operation-specific scopes, egress policy, durable publish
checkpoints, rate limits, error classification, and observable outcomes.

Only small pure rules can be reused after focused tests. In particular:

- Instagram's `maxLength()` value and basic attachment-count rules can seed a
  versioned validator, but must not remain the authority.
- Instagram's and TikTok's `handleErrors()` methods can be fallback copy maps
  after secret stripping, but cannot determine retry safety.
- TikTok's floor-based chunk plan and final-remainder behavior follow the
  official algorithm, but the constants and boundary units need explicit
  contract tests.
- Provider identifiers and display metadata can seed a static registry. Do not
  instantiate every provider class just to read metadata because that pulls in
  the entire NestJS, Prisma, Temporal, Sharp, and helper dependency graph.

There must be no claim that ClipStitchr can publish live until an authorized
account produces a provider-confirmed result through the deployed adapter. Mock
responses, a successful OAuth redirect, an init response, an Instagram
container ID, a TikTok `publish_id`, or a TikTok inbox delivery are not proof of
a published post.

## Implemented executable adapter slice

The publishing service now contains a runnable, dependency-injected provider
protocol slice under `web/services/publishing-service/src/provider-runtime/`.
It is ClipStitchr-owned adapter code based on the official contracts and the
audited Postiz sequencing. The retained Postiz classes stay inside the traced
vendor boundary and are not called directly.

The implemented slice includes:

- a fixed-origin HTTPS transport with redirect refusal, a streaming one MiB
  response ceiling that cancels oversized bodies, time bounds, typed status
  handling, and no raw provider payload in errors;
- a closed runtime registry containing Instagram, optional Instagram
  Standalone, and TikTok only;
- authorization initiation that always uses the publishing service's
  cryptographic, tenant-bound, single-use OAuth state store;
- confidential TikTok web authorization and code exchange without PKCE or a
  `code_verifier`;
- TikTok token rotation, creator-info parsing, current privacy and interaction
  enforcement, explicit direct-post consent, server-media `PULL_FROM_URL`
  initialization limited to a configured verified ClipStitchr origin and media
  verification capability, status mapping, analytics parsing, and raw-body
  webhook HMAC verification with a caller-owned replay claim seam;
- configurable, validated Meta Graph versions with no `latest` fallback;
- Facebook Login and Instagram Login authorization and token exchange, plus
  standalone long-lived token refresh;
- resumable Instagram image, carousel, and reel container processing, mandatory
  publishing-limit admission, bearer authentication for Graph resource calls,
  publish response handling, and analytics parsing without synthetic percentage
  changes.

The runtime returns `accepted` for TikTok init. A network or server failure
across init returns `outcome_unknown` and is not an automatic retry signal. It returns
`requires_user_action` for `SEND_TO_USER_INBOX`, and only returns `published`
after a provider completion status. Instagram returns `processing` when its
single status check still reports `IN_PROGRESS`, without sleeping in the
provider method. Every advance returns a checkpoint containing its phase and all
known child and parent container IDs. A lost container-create or
`media_publish` response moves to `outcome_unknown` and cannot dispatch again.
A failed permalink lookup retains the confirmed published media ID. Persistence
must commit each checkpoint before a worker continues.

Deterministic tests live beside the publishing service tests and use an injected
fake transport. They cover provider exclusion, service-owned OAuth state,
TikTok web exchange, token expiration fields, creator settings and consent,
pull initialization, foreign and unverified media rejection, ambiguous init,
every retained status outcome, webhook verification and replay claiming,
redaction, Instagram single image, carousel, reel, resumable status checks,
quota exhaustion, confirmed publishing with failed permalink lookup, both Meta
login paths, refresh, and analytics parsing. They do not make live provider
requests and contain no credentials.

## Audited retained source

The audit covers:

- `libraries/nestjs-libraries/src/integrations/social.abstract.ts`
- `libraries/nestjs-libraries/src/integrations/social/social.integrations.interface.ts`
- `libraries/nestjs-libraries/src/integrations/social/instagram.provider.ts`
- `libraries/nestjs-libraries/src/integrations/social/instagram.standalone.provider.ts`
- `libraries/nestjs-libraries/src/integrations/social/tiktok.provider.ts`
- `libraries/nestjs-libraries/src/integrations/integration.manager.ts`
- `libraries/nestjs-libraries/src/integrations/refresh.integration.service.ts`
- the retained integration DTOs and media/post DTOs
- the retained integrations controller and repository/service path
- `apps/orchestrator/src/activities/post.activity.ts`
- `apps/orchestrator/src/workflows/post-workflows/post.workflow.v1.0.5.ts`
- `apps/orchestrator/src/workflows/refresh.token.workflow.ts`

## Official contract facts that control the adapter

### Instagram

- Meta's current content-publishing guide supports professional accounts and
  requires the publishing media to be reachable on a public server while Meta
  fetches it. It documents `/<IG_ID>/media`, `/<IG_ID>/media_publish`, container
  status, and `/<IG_ID>/content_publishing_limit`.
- With Instagram Login, publishing needs
  `instagram_business_basic` and `instagram_business_content_publish`. Insights
  and comments have separate permissions.
- With Facebook Login, publishing needs `instagram_basic`,
  `instagram_content_publish`, and `pages_read_engagement`; initial Page
  discovery also uses `pages_show_list`. `business_management` should not be a
  default publishing permission. If Business Manager discovery is retained,
  request and explain it only for that operation.
- Apps serving professional accounts they do not own or manage need Advanced
  Access. Standard Access only covers accounts owned or managed by app roles.
- The account publishing limit is 100 API-published posts in a moving 24-hour
  period, with a carousel counting as one post. Query the account's live limit
  before admitting or executing scheduled work. The retained error copy saying
  25 posts is not an authoritative limit.
- A carousel contains at most 10 media containers. JPEG is the documented image
  format for this publishing flow.
- Container states include `IN_PROGRESS`, `FINISHED`, `PUBLISHED`, `ERROR`, and
  `EXPIRED`. Meta recommends polling once per minute for no more than five
  minutes. A container that is `ERROR` or `EXPIRED` must never be sent to
  `media_publish`.
- Instagram Login authorization codes are single-use and valid for one hour.
  Short-lived tokens are exchanged server-side for long-lived tokens valid for
  about 60 days. A valid long-lived token can be refreshed after it is at least
  24 hours old; an expired token cannot be refreshed.
- Facebook long-lived user tokens generally last about 60 days. A Page token
  derived from a long-lived user token has different invalidation behavior. Do
  not call the retained Facebook `refreshToken()` stub, which returns empty
  credentials.
- Insights permissions and available metrics differ by login type, account,
  media type, and follower count. Missing data can be an empty set rather than
  zero. Never synthesize a percentage change.

### TikTok

- TikTok Login Kit for Web uses a cryptographically random `state`, an exact
  registered HTTPS callback, and a server-side code exchange with a client
  secret. Web does **not** use PKCE. `code_verifier` is required for mobile and
  desktop only.
- Desktop PKCE requires a new 43 to 128 character verifier, a SHA-256 challenge
  encoded as TikTok documents, and `code_challenge_method=S256`. The mobile
  SDKs also use PKCE. Do not share a web OAuth builder with desktop or mobile.
- The retained TikTok web flow is internally inconsistent: it sets
  `codeVerifier = state`, sends no `code_challenge` in the authorization
  request, then sends `code_verifier` at exchange. Replace it; do not patch
  around it.
- Web callback URIs must be static HTTPS URLs with no query or fragment and must
  exactly match the registered value. The production flow must never use
  `redirectmeto.com` or derive a callback from an arbitrary request origin.
- TikTok access tokens normally expire within 24 hours. The token response is
  authoritative for `expires_in`, `refresh_expires_in`, scopes, and rotated
  refresh token. Persist a refresh response atomically before discarding the
  prior token.
- `video.publish` means direct post. `video.upload` means sending a draft to the
  user's TikTok inbox for manual completion. Inbox delivery is not publication.
- Before each direct-post export screen and publish, query creator info and
  honor the returned account, privacy options, interaction restrictions, and
  maximum video duration. Creator-info calls are limited to 20 per user token
  per minute. Video and photo init calls are limited to 6 per user token per
  minute.
- Direct-post video captions allow 2200 UTF-16 runes. Photo titles allow 90 and
  photo descriptions allow 4000. The retained global TikTok `maxLength()` of
  2000 and DTO assumptions are incomplete.
- Unaudited clients are restricted to private visibility and can be blocked
  when their account or privacy selection is incompatible. Public visibility
  must not be promised before TikTok audit approval.
- TikTok says server-hosted media should use `PULL_FROM_URL`; `FILE_UPLOAD` is
  for media on the user's device. A pull URL must be HTTPS, owned and verified
  in the TikTok app, must not redirect, and must remain available for the
  one-hour download window. ClipStitchr should expose an owned, stable,
  provider-specific media URL rather than an arbitrary or short-lived object
  URL.
- The ClipStitchr media-signing contract requests 4,500 seconds and rejects a
  TikTok grant with less than 4,200 seconds remaining. It also fails closed
  unless the URL origin exactly matches the server-configured verified
  ClipStitchr origin and the signer guarantees that same URL is no-redirect and
  supports GET, HEAD, and byte ranges. Immediately before minting, it re-HEADs
  the object, rejects a changed checksum/version, and passes that immutable
  identity into the gateway request. The
  production signer/gateway is still an explicit launch seam: a raw
  `r2.cloudflarestorage.com` presigned URL does not satisfy domain verification,
  and TikTok PULL must not be marked ready until the exact provider-visible URL
  passes an end-to-end probe. Persist only the durable object descriptor,
  re-resolve its current owner-scoped record/revision for every attempt, and
  mint this URL immediately before the TikTok init call.
- Photo posts only support `PULL_FROM_URL` and may contain up to 35 photos. The
  current ClipStitchr Swipe range of 3 to 8 is within this provider limit, but
  the full saved bundle must be sent, not its poster.
- For video `FILE_UPLOAD`, chunks are sequential, normally 5 MB to 64 MB, the
  final chunk may include the remainder up to 128 MB, and the count is floor
  division. Intermediate uploads return 206 and the final upload returns 201.
  The response `Content-Range` is the checkpoint for bytes accepted.
- A `publish_id` tracks the operation. Statuses include
  `PROCESSING_UPLOAD`, `PROCESSING_DOWNLOAD`, `SEND_TO_USER_INBOX`,
  `PUBLISH_COMPLETE`, and `FAILED`. A publicly available post ID is returned
  only after public visibility and moderation. Private posts can be complete
  without that ID.
- TikTok content webhooks are delivered at least once. Verify the
  `TikTok-Signature` over the raw body, enforce a timestamp window, and dedupe
  events. An inbox draft can produce multiple posts, so one `publish_id` can
  map to more than one post.
- Display analytics use `user.info.stats` and `video.list`. User/video display
  endpoints default to 600 requests per minute on a sliding window, separate
  from the stricter Content Posting limits.

## Cross-cutting security and correctness findings

### OAuth and credentials

1. The retained Meta states are six random characters from `Math.random()` and
   the TikTok state also uses `Math.random()`. Replace both with at least 256
   bits from a cryptographic RNG.
2. Store one opaque, single-use state record that binds tenant, Clerk user,
   provider, exact callback, intended connection or reconnect action, creation
   time, and expiration. Consume it atomically before exchanging the code.
3. Reject callback errors, missing or mismatched state, provider mismatch,
   tenant mismatch, replay, and expiration before any provider request.
4. Callback URIs come from a validated `CLIPSTITCHR_PUBLIC_ORIGIN` and a static
   provider route. Do not append `refresh` or a return URL to the provider
   callback. Keep navigation data in the server-side state record.
5. The retained repository stores `token` and `refreshToken` as plaintext and
   combines Instagram Page and user tokens with `___`. Store separate,
   context-bound AES-GCM envelopes with a key version. Never concatenate
   credentials into an application string.
6. Never return tokens to the browser. Never put a token, app secret, signed
   media URL, TikTok upload token, OAuth code, or raw provider body into logs,
   audit events, errors, or Temporal history.
7. The retained post and refresh workflows pass a full Prisma `Integration`
   through Temporal. That serializes credentials into durable workflow history.
   Workflows must carry only connection and attempt IDs. Activities resolve the
   tenant, decrypt credentials locally, perform one bounded operation, and
   return a sanitized result.

### Network and media

1. Replace `SocialAbstract.fetch()` with endpoint-specific clients. It only
   accepts 200/201, applies a fixed retry, retries some POST requests without an
   idempotency decision, ignores most `Retry-After` behavior, and can include
   request bodies in Temporal failures.
2. TikTok and Meta can return an HTTP success with an error envelope. Success
   requires both an allowed HTTP status and the provider's success code or
   required response fields.
3. Provider API hosts are fixed allowlists. A TikTok `upload_url` is accepted
   only from the authenticated init response, must be HTTPS, must pass public
   DNS/IP validation, must match a reviewed TikTok upload host policy, and must
   not follow redirects to a different host.
4. Never let a provider method fetch a user-supplied URL. Resolve an authorized
   ClipStitchr media reference, re-check tenant ownership, HEAD the exact R2
   object, and create a just-in-time provider URL.
5. `readOrFetch()` uses Axios without the retained SSRF dispatcher, and
   `tiktokMediaSize()` and `tiktokChunkStream()` use global `fetch()` on any
   string beginning with `http`. None is an acceptable media bridge.
6. `hasExtension()` searches the whole URL for a substring. Use stored media
   type plus server-verified content type, byte size, dimensions, codec, frame
   rate, and duration. A query string containing `.mp4` is not proof of video.
7. Build Meta request parameters with `URLSearchParams` or a supported request
   body. The retained Instagram code inserts a signed media URL directly into a
   larger query, so `&` and other URL characters can corrupt the request and
   leak credentials.

### Retry safety and uncertain outcomes

The retained Temporal activity retries a publish up to three times. Neither
provider accepts ClipStitchr's local idempotency key. A provider can publish and
lose the response, after which an automatic retry creates a duplicate.

Use a durable attempt state machine:

1. Create one local attempt with a unique constraint on the scheduled post,
   destination, media revision, and requested publish mode.
2. Persist every provider checkpoint before the next network step: Meta child
   container IDs, carousel container ID, the fact that `media_publish` was
   dispatched, TikTok `publish_id`, upload URL expiry, and accepted byte range.
3. A timeout before any provider identifier is returned is
   `outcome_unknown`, not retryable by default.
4. For Meta, reconcile a known container through status. If a
   `media_publish` response was lost, do not submit it again until reconciliation
   proves it was not published. Multi-story publishing needs one child attempt
   and result per story so a later failure cannot duplicate earlier stories.
5. For TikTok, reconcile a known `publish_id` through status and signed
   webhooks. Resume only the next unaccepted upload range. Do not create a new
   init request merely because polling exceeded nine minutes.
6. A workflow timeout leaves the attempt pending and schedules later
   reconciliation. It does not turn a potentially successful remote operation
   into a generic failure.

## Observable result contract

Replace the retained four-string `PostResponse` with a discriminated result.
Each transition must be persisted and visible to the user.

| Result kind | Meaning | Safe automatic action |
| --- | --- | --- |
| `accepted` | Provider returned a container or `publish_id`; nothing is proven published | Continue from the persisted checkpoint |
| `media_transfer_pending` | Provider is fetching or receiving bytes | Poll or resume the recorded range |
| `processing` | Provider accepted all media and is processing | Poll later or await webhook |
| `requires_user_action` | TikTok sent a draft to the inbox | Tell the user to finish in TikTok; never label published |
| `published` | Provider explicitly confirmed completion | Store every provider post ID, URL when known, and visibility |
| `published_not_public` | TikTok confirmed completion but no public ID exists | Show complete with private or unknown visibility, not a public link |
| `partially_published` | Some independent story/draft items succeeded and others failed | Show each child result; retry only unstarted children after user choice |
| `auth_required` | Token expired, revoked, or scopes were removed | Stop and request reconnect |
| `rate_limited` | Provider or local limit blocked the operation | Retry only at the recorded provider-safe time |
| `rejected` | Permanent validation, policy, permission, or moderation failure | Do not retry unchanged input |
| `transient_failure` | Provider explicitly documents a retryable failure before an uncertain publish boundary | Retry from the durable checkpoint |
| `outcome_unknown` | Connection failed across a non-idempotent boundary | Reconcile or escalate; never blind retry |
| `cancelled` | A pending provider operation was cancelled or the local schedule was withdrawn before dispatch | Stop future work and retain the audit trail |

Each result also needs `attemptId`, `provider`, `connectionId`, provider request
or log ID when safe, provider operation ID, occurred-at time, retryability,
visibility, one or more remote post IDs/URLs, and a redacted user-facing reason.

## Method-by-method adapter matrix

Legend: **direct** means safe to call without a ClipStitchr wrapper. **seed**
means reuse only as a tested pure rule. **replace** means no direct call.

### Shared base, manager, persistence, and workflows

| Retained method/path | Disposition | Adapter requirement |
| --- | --- | --- |
| `SocialAbstract.checkValidity()` | Replace | Base implementation always returns true. Run provider/version-specific validation against verified media metadata. |
| `assetBoolean()` | Seed | Normalize booleans in an isolated pure helper; reject ambiguous values at the API boundary. |
| `getImageDimensions()` | Replace | It builds a URL from `FRONTEND_URL` and uses an SSRF-unsafe transitive fetch. Read an owned R2 object through the media bridge. |
| `mention()` | Omit initially | Both retained providers use the default no-op. Do not expose a dead control. |
| `runInConcurrent()` | Replace | It does not enforce provider concurrency. Use Redis-backed tenant, user-token, and global limits. |
| `fetch()` | Replace | Use fixed-host clients, timeouts, aborts, typed envelope parsing, redaction, per-endpoint success statuses, and retry policy. |
| `checkScopes()` | Seed | Check required scopes per operation. Do not fail a publishing connection because an optional analytics scope was declined. |
| `RefreshToken`, `BadBody` | Replace | Return sanitized domain errors. Never serialize request bodies or credentials into Temporal failures. |
| `IntegrationManager.getAllIntegrations()` | Replace | Static ClipStitchr registry with only the three retained identifiers and explicit capabilities. |
| `getAllowedSocialsIntegrations()` | Seed | The allowlist is correct, but it must be enforced without instantiating provider classes. |
| `getSocialIntegration()` | Replace | Fail closed on an unknown identifier; retained non-null assertion can return undefined at runtime. |
| repository `createOrUpdateIntegration()` | Replace | Tenant-scoped transaction, encrypted credential envelopes, granted scopes, expiry, key version, provider account IDs, and audit receipt. |
| `RefreshIntegrationService.refresh()` | Replace | Provider-specific refresh policy, atomic token rotation, distributed lock, retry classification, and reconnect state. |
| `postWorkflowV105()` | Replace around source semantics | Keep durable scheduling, but remove credentials from history and add attempt checkpoints and uncertain-outcome reconciliation. |
| `refreshTokenWorkflow()` | Replace | Carry a connection ID only, use provider-returned expirations, jitter refresh, lock rotation, and stop cleanly on revocation. |

### Instagram with Facebook Login

| Retained method | Disposition | Adapter requirement |
| --- | --- | --- |
| metadata and `maxLength()` | Seed | Put provider metadata and caption limits in a versioned capability schema. |
| `checkValidity()` | Seed | Keep 1 to 10 items and trial/audio shape rules, then add verified format, size, dimensions, duration, story, collaborator, and account capability checks. |
| `refreshToken()` | Replace | It is an empty stub. Exchange for long-lived tokens during connect, monitor expiry/invalidation, and require reauthorization when needed. |
| `handleErrors()` | Seed | Retain useful user copy only after parsing Meta's structured error. Correct the stale 25-post message and decide retryability by operation phase. |
| `generateAuthUrl()` | Replace | Use current configured Graph version, exact callback, cryptographic single-use state, least scopes, and no fake verifier. |
| `authenticate()` | Replace | Validate state first, use the exact original callback, parse every error, verify app/user/scopes, exchange server-side, and encrypt tokens. Never append `refresh` to the callback. |
| `pages()` | Replace | Use paginated `/me/accounts` with least privilege. Make Business Manager discovery an explicit optional capability, not a silent catch-all. |
| `fetchPageInformation()` | Replace | Verify the selected Page belongs to the OAuth result and tenant. Store Page and user tokens separately. |
| `reConnect()` | Replace | Resolve by connection ID and selected provider account, not by splitting a credential string. |
| `post()` | Replace | Reuse endpoint sequencing only. Encode media URLs, persist every container, honor `ERROR`/`EXPIRED`, poll at the documented interval, enforce the live account limit, and classify lost publish responses as unknown. |
| `comment()` | Replace or defer | Only expose if the composer supports it and `instagram_manage_comments` is granted. Persist the parent result first and make comment attempts independent. |
| `analytics()` | Replace | Current code uses mixed Graph versions and hard-codes `percentageChange: 5`. Query supported metrics, preserve empty versus zero, and calculate change only from actual periods. |
| `music()` and `audioSearch()` | Defer | These are outside the basic provider interface. Ship only after account eligibility, permission, API version, and UI behavior are verified live. |
| `postAnalytics()` | Replace | Do not swallow every error as empty data. Select metrics by media/login type and return unavailable, auth-required, rate-limited, or data distinctly. |

### Instagram with Instagram Login

| Retained method | Disposition | Adapter requirement |
| --- | --- | --- |
| metadata and `maxLength()` | Seed | Share a versioned Instagram capability schema without sharing OAuth credentials or host assumptions. |
| `checkValidity()` | Replace | It omits the 10-item limit and several audio/story checks present in the Facebook provider. Use one complete validator with login-type capabilities. |
| `handleErrors()` | Seed | Shared copy is useful, but parse `graph.instagram.com` responses and feature availability separately. |
| `generateAuthUrl()` | Replace | Exact production HTTPS callback, cryptographic state, operation-specific scopes, and no `redirectmeto.com`. |
| `authenticate()` | Replace | State first, one-time code, exact callback, typed short-token exchange, server-side long-token exchange, granted-scope validation, and encrypted storage. |
| `refreshToken()` | Replace | The endpoint is correct in concept, but use returned `expires_in`, parse errors, lock and atomically replace the encrypted token. |
| `post()` | Replace | Shared Instagram publishing protocol is valid in concept; use the Instagram host and feature matrix, with durable containers and no composite token. |
| `comment()` | Replace or defer | Require `instagram_business_manage_comments`; persist a separate result. |
| `analytics()` and `postAnalytics()` | Replace | Use metrics available for Instagram Login. Facebook-only aggregate metrics must not leak into this path. |

### TikTok

| Retained method/helper | Disposition | Adapter requirement |
| --- | --- | --- |
| metadata | Seed | Capabilities depend on granted scopes, audit status, live creator info, and publish mode. |
| `maxLength()` | Replace | Video is 2200 UTF-16 runes; photo title is 90 and description is 4000. Validate the actual field. |
| `checkValidity()` | Seed | Add max 35 photos, exact formats, dimensions, size, video codec/frame rate/duration, creator maximum, and full Swipe bundle checks. |
| `handleErrors()` | Seed | Parse `error.code` even on HTTP 200. `internal` and documented pull failures can be retryable; auth removal and spam/policy failures are not. |
| `generateAuthUrl()` | Replace | Web uses cryptographic state and no PKCE. Use a dedicated web flow and exact static callback. |
| `authenticate()` | Replace | Do not send a web `code_verifier`. Validate state, parse partial scopes, encrypt both tokens, and store provider expirations. |
| `refreshToken()` | Replace | Persist the returned access token, rotated refresh token, scope, `expires_in`, and `refresh_expires_in` atomically. |
| `maxVideoLength()` | Replace with creator-info query | Return the complete creator-info capability snapshot and enforce its 20/minute limit and short cache. |
| `contentPostingMethod()` | Replace | Missing input currently defaults to direct publication. Require the user's explicit current choice and consent before transfer. |
| `postingMethod()` | Seed | Endpoint selection is correct only after granted-scope and mode validation. |
| `buildTikokPostInfoBody()` | Replace | Validate privacy against current creator info, use field-specific rune limits, honor disabled interactions, and record commercial/AIGC declarations. |
| `tiktokChunkPlan()` | Seed | Preserve floor division and final remainder, but define reviewed byte units and test every 5/64/128 MB boundary plus the official examples. |
| `tiktokMediaSize()` / `tiktokChunkStream()` | Replace | Resolve only an owned immutable R2 revision. Validate HEAD/range responses and exact bytes; never fetch an arbitrary HTTP URL. |
| `uploadTikTokVideoBytes()` | Replace | Prefer verified `PULL_FROM_URL` for server-hosted R2 media. If a permitted device upload uses chunks, persist accepted ranges and enforce upload URL expiry/host policy. |
| `buildTikokSourceInfoBody()` | Replace | Use a stable verified no-redirect ClipStitchr URL for server media. Send every photo in the saved Swipe bundle. |
| `post()` | Replace | Persist `publish_id` before transfer, never default direct, separate direct from inbox draft, and return accepted/processing rather than blocking for nine minutes. |
| `uploadedVideoSuccess()` | Replace | Poll asynchronously and consume signed webhooks. `SEND_TO_USER_INBOX` is user action, no public ID can still be a completed private post, and timeout remains pending. |
| `analytics()` | Replace | Current result is only current user totals plus the latest 20 public videos, not a dated series. Name it accurately, paginate when needed, and surface errors. |
| `missing()` | Replace or defer | Cover URLs expire after hours. Do not persist them as durable media; refresh them through `video.list`. |
| `postAnalytics()` | Replace | Persist typed `publish_id` and public post IDs rather than testing an ID prefix. Query only posts owned by the connection and distinguish unavailable from zero. |

## Scope and limit matrix

| Provider operation | Minimum relevant scopes/permissions | Local gate |
| --- | --- | --- |
| Instagram Facebook account discovery | `instagram_basic`, `pages_show_list` | Per-user OAuth-start and provider-read limits |
| Instagram Facebook publish | `instagram_basic`, `instagram_content_publish`, `pages_read_engagement` | Tenant and account limits, plus live `content_publishing_limit` |
| Instagram Facebook comments | `instagram_manage_comments` plus base access | Only when the feature is exposed |
| Instagram Facebook insights | `instagram_manage_insights`, `pages_read_engagement` plus base access | Cached tenant/account reads; metric-aware |
| Instagram Login publish | `instagram_business_basic`, `instagram_business_content_publish` | Tenant and account limits, plus live publishing limit |
| Instagram Login comments | `instagram_business_manage_comments` | Only when exposed |
| Instagram Login insights | `instagram_business_manage_insights` plus base access | Cached tenant/account reads |
| TikTok identity | `user.info.basic`; `user.info.profile` only for username/profile fields | Per-tenant OAuth/read limits |
| TikTok direct post | `video.publish` | Creator info 20/minute/token; init 6/minute/token; tenant/global spend and queue limits |
| TikTok inbox draft | `video.upload` | Init 6/minute/token; at most five pending shares in 24 hours |
| TikTok account stats | `user.info.stats` | Display API default 600/minute sliding window plus stricter local cache |
| TikTok public-video analytics | `video.list` | Display API default 600/minute sliding window plus pagination budget |

Request only the capabilities ClipStitchr will actually expose. Because users
may grant a subset, store granted scopes and disable only the missing operation.

## Suggested atomic adapter tree

This is a target shape, not authorization to create these files in this audit.

```text
web/services/publishing-service/src/providers/
  contracts/
    ProviderAdapter.ts
    ProviderCapability.ts
    ProviderOperationResult.ts
    ProviderPublishRequest.ts
    ProviderError.ts
  registry/
    createPublishingProviderRegistry.ts
  http/
    executeFixedProviderRequest.ts
    validateProviderUploadUrl.ts
    parseRetryAfter.ts
  instagram/
    shared/
      validateInstagramPublishRequest.ts
      createInstagramMediaContainer.ts
      getInstagramContainerStatus.ts
      publishInstagramContainer.ts
      reconcileInstagramPublishAttempt.ts
      getInstagramPublishingLimit.ts
      mapInstagramError.ts
    facebook/
      createFacebookInstagramAuthorizationUrl.ts
      exchangeFacebookInstagramCode.ts
      exchangeFacebookLongLivedToken.ts
      listFacebookInstagramAccounts.ts
      createFacebookInstagramAdapter.ts
    standalone/
      createInstagramAuthorizationUrl.ts
      exchangeInstagramCode.ts
      exchangeInstagramLongLivedToken.ts
      refreshInstagramLongLivedToken.ts
      createInstagramStandaloneAdapter.ts
  tiktok/
    createTikTokWebAuthorizationUrl.ts
    exchangeTikTokWebCode.ts
    refreshTikTokToken.ts
    getTikTokCreatorInfo.ts
    validateTikTokPublishRequest.ts
    createTikTokPullUrl.ts
    initializeTikTokPost.ts
    getTikTokPostStatus.ts
    mapTikTokPostStatus.ts
    verifyTikTokWebhook.ts
    reconcileTikTokPublishAttempt.ts
    createTikTokAdapter.ts
```

Credentials, media ownership, persistence, rate limits, and transactional
outbox workflows remain separate service modules. Provider adapters receive
narrow interfaces; they must not import Clerk, Prisma models containing tokens,
or arbitrary URLs.

## Dependency closure

Importing the retained classes unchanged requires more than the three provider
files:

- runtime packages: `dayjs`, `sharp`, `axios`, `class-transformer`,
  `class-validator`, `class-validator-jsonschema`, `@prisma/client`,
  `@temporalio/activity`, `@temporalio/common`, `@temporalio/workflow`,
  `@nestjs/common`, `@nestjs/swagger`, `nestjs-temporal-core`, `ioredis`, and
  `lodash`;
- a resolvable `undici` package for the retained SSRF dispatcher, although it is
  not a direct dependency in the audited upstream root manifest;
- the `@gitroom/*` TypeScript path aliases and their helper, DTO, database,
  upload, Redis, authorization, and Temporal modules;
- generated Prisma `Integration` and `Post` types matching the retained schema;
- Node server support for `fetch`, `FormData`, streams, `fs`, and Undici's
  `duplex: 'half'` request option.

Do not copy that closure into a Next.js route. The publishing service owns
Redis, PostgreSQL, and its transactional outbox dispatcher. A focused adapter
should depend on Node's
crypto/fetch primitives, the service's existing encrypted credential and rate
limit interfaces, and explicit provider response schemas. Keep `sharp` only in
the media-inspection boundary if the existing media metadata cannot provide the
required dimensions. Keep Prisma and outbox orchestration outside provider
protocol code. The upstream Temporal packages listed above remain audit
context only and are not runtime dependencies of ClipStitchr's service.

## Deterministic contract-test matrix

All provider HTTP tests use a local fake server or injected transport. No test
may call a real provider unless it is an explicitly labeled credentialed smoke
test against an authorized test account.

| Area | Required deterministic cases |
| --- | --- |
| OAuth state | 256-bit entropy shape, exact tenant/user/provider/callback binding, expiry, wrong tenant, wrong provider, callback mismatch, atomic consume, replay rejection |
| TikTok web OAuth | authorize URL has state but no PKCE fields; exchange has no `code_verifier`; desktop/mobile input is rejected by the web adapter |
| Meta OAuth | exact callback round trip, cancellation, one-time code error, missing scopes, partial scopes, wrong app/user token inspection |
| Token storage | ciphertext only at rest, context mismatch fails, key rotation works, refresh rotation is atomic, no token appears in logs, errors, outbox payloads, or checkpoint snapshots |
| Provider envelopes | HTTP 200 plus non-success provider code is failure; malformed JSON, oversized body, 401, 403, 429, 5xx, timeout, abort, and redaction |
| Media egress | wrong tenant, changed object version, unsupported content type, size mismatch, redirect, private IP, range ignored, short body, signed URL redaction |
| Instagram validation | zero/1/10/11 items, mixed carousel, story, reel, trial reel, audio eligibility, collaborators, bad aspect/format/duration, UTF limits |
| Instagram lifecycle | child containers, carousel parent, `IN_PROGRESS`, `FINISHED`, `PUBLISHED`, `ERROR`, `EXPIRED`, poll budget, rate-limit usage |
| Instagram idempotency | lost child response, lost `media_publish` response, expired outbox lease, multi-story partial success, reconciliation prevents duplicates |
| Instagram analytics | empty versus zero, unsupported metric, login-type difference, fewer-than-100-followers behavior, auth/rate failures, real percentage calculation |
| TikTok creator info | every privacy option set, private account, disabled comments/duet/stitch, per-user duration, stale cache, 20/minute gate |
| TikTok consent | missing mode fails, direct and inbox are distinct, stale consent fails, content remains editable before dispatch |
| TikTok request fields | video 2200 boundary, photo 90/4000 boundaries, commercial toggles, AIGC, privacy mismatch, full 3-to-8 Swipe bundle |
| TikTok pull | verified owned prefix, HTTPS only, no redirect, one-hour availability contract, photo array, provider fetch timeout |
| TikTok chunk fallback | official 4,194,304 and 50,000,123 byte examples; exact 5/64/128 MB boundaries; floor count; sequential ranges; 206 then 201; 416 resume; expired upload URL |
| TikTok lifecycle | every documented status, inbox is user action, complete with public ID, complete without public ID, one publish ID to multiple posts, failed reasons |
| TikTok webhooks | valid signature, wrong signature, stale timestamp, raw-body preservation, duplicate delivery, out-of-order delivery, unknown connection |
| TikTok analytics | missing optional scopes, 20-video page, pagination, expiring cover URL, unavailable versus zero, 600/minute local guard |
| Workflow recovery | worker crash after every checkpoint, schedule cancellation, refresh during publish, lease expiry, retry never crosses an unknown non-idempotent boundary |

## Live verification and release gates

Before enabling a provider in production:

1. Configure the exact callback, trusted/verified domains, webhook, app products,
   permissions/scopes, access level, and provider review status.
2. Run OAuth with a dedicated authorized professional/test account. Confirm
   state replay is rejected and the database, logs, outbox payloads, and
   checkpoints contain no plaintext credential.
3. Publish one smallest valid artifact through the full production-shaped
   worker path and persist the provider receipt.
4. For Instagram, require a returned media ID, a successful container state,
   and a retrievable permalink. Verify rate-limit and insights behavior.
5. For TikTok direct post, require `PUBLISH_COMPLETE`. Describe visibility as
   private until an authorized result and audit status prove otherwise. A
   public-post claim additionally requires the public ID or
   `post.publish.publicly_available` webhook.
6. For TikTok upload, require `SEND_TO_USER_INBOX`, show the manual completion
   step, then observe completion separately. Never relabel inbox delivery as a
   publish.
7. Force one timeout after the remote acceptance boundary and prove
   reconciliation does not duplicate the post.
8. Keep each provider disabled if credentials, review, access, verified domain,
   webhook validation, or an authorized result is absent.

## Primary official sources

Meta:

- [Instagram Platform content publishing](https://developers.facebook.com/documentation/instagram-platform/content-publishing)
- [Instagram API with Facebook Login getting started](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/get-started/)
- [Business Login for Instagram](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login/)
- [Manually build a Facebook Login flow](https://developers.facebook.com/documentation/facebook-login/guides/advanced/manual-flow)
- [Meta long-lived access tokens](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens/get-long-lived)
- [Instagram Platform insights](https://developers.facebook.com/documentation/instagram-platform/insights)

TikTok:

- [Login Kit for Web](https://developers.tiktok.com/doc/login-kit-web)
- [Login Kit overview and platform differences](https://developers.tiktok.com/doc/login-kit-overview)
- [Login Kit for Desktop PKCE](https://developers.tiktok.com/doc/login-kit-desktop/)
- [OAuth v2 user access token management](https://developers.tiktok.com/doc/oauth-user-access-token-management)
- [Content Posting API get started](https://developers.tiktok.com/doc/content-posting-api-get-started)
- [Direct Post API reference](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post)
- [Photo Post API reference](https://developers.tiktok.com/doc/content-posting-api-reference-photo-post)
- [Upload API reference](https://developers.tiktok.com/doc/content-posting-api-reference-upload-video)
- [Content Posting media transfer guide](https://developers.tiktok.com/doc/content-posting-api-media-transfer-guide)
- [Query creator info](https://developers.tiktok.com/doc/content-posting-api-reference-query-creator-info)
- [Get post status and content-posting webhooks](https://developers.tiktok.com/doc/content-posting-api-reference-get-video-status)
- [Content sharing guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines/)
- [TikTok API scopes](https://developers.tiktok.com/doc/tiktok-api-scopes)
- [Display API rate limits](https://developers.tiktok.com/doc/tiktok-api-v2-rate-limit)
- [Get user info](https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info/)
- [List videos](https://developers.tiktok.com/doc/tiktok-api-v2-video-list/)
- [Query videos](https://developers.tiktok.com/doc/tiktok-api-v2-video-query/)
- [Webhook signature verification](https://developers.tiktok.com/doc/webhooks-verification)
- [Webhook delivery behavior](https://developers.tiktok.com/doc/webhooks-overview)
