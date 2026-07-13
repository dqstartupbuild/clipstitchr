# Post Bridge Bulk Queue

Dashboard Library selection mode can add selected saved Stitches or Swipes to
the user's Post Bridge queue with one review and confirmation flow.

Provider source reference: `https://api.post-bridge.com/reference`.

## How It Works

`Queue selected` opens one batch dialog. The user chooses connected accounts
and optional Swipe sound once, then reviews the numbered caption for every
selected draft. After confirmation, ClipStitchr renders, uploads, and queues
each item sequentially so browser media work stays bounded.

The dialog reports the active item and total progress. When an item fails, the
dialog preserves the completed count and changes its action to continue with
the remaining items. A continuation starts at the first unfinished item rather
than sending completed posts again.

## Provider Pacing

Post Bridge limits each API key to 10 requests per second, and one queued post
can require several API calls: create a media upload URL, load connected
accounts, and create the post. ClipStitchr therefore applies one centralized
provider pacing bucket keyed by a SHA-256 hash of the saved Post Bridge API key.
It reserves calls at 8 requests per second with an initial burst of 2, then
waits before making the provider request. This covers dashboard, CLI, account,
queue, and analytics calls that share the same Post Bridge key.

Provider `429` retries remain as a fallback for transient provider pressure.
Each retry also passes through the pacing bucket.

## Rate Limits and Abuse Protection

Each item still consumes the existing R2 upload, Post Bridge upload-byte,
schedule-create, and Convex metadata-update limits. Schedule creation allows a
60-post burst, no more than 100 posts per hour, 1,000 posts per day per user,
and 10,000 posts per day globally. The hourly cap matches Post Bridge's
published platform limit.

The CLI and dashboard use the same owner-scoped schedule and upload limits. The
provider pacing bucket is keyed by the saved Post Bridge key, so it is also
shared when both entry points use that key.

## Source Files

- `web/app/_components/postBridge/PostBridgeBatchQueueDialog.tsx`
- `web/lib/clipstitchr/client/queuePostBridgeBatchItems.ts`
- `web/lib/clipstitchr/server/postBridge/requestPostBridge.ts`
- `web/lib/clipstitchr/server/postBridge/reservePostBridgeProviderRequest.ts`
- `web/lib/clipstitchr/server/postBridge/createPostBridgeProviderRateLimitKey.ts`
- `web/convex/postBridgeRateLimits/reservePostBridgeProviderRequest.ts`
- `web/convex/rateLimiter.ts`
- `docs/backend/rate-limits.md`
