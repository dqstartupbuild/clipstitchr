# Zernio Bulk Queue

Library selection mode can add several saved Stitches or Swipes to the user's
Zernio queue from one review dialog.

## How It Works

Queue selected loads connected accounts once for the selected product. The user
chooses accounts and optional Swipe sound, reviews each numbered caption, and
confirms the batch. When TikTok is selected, the same required privacy,
commercial-content, and explicit-consent review applies to the whole batch.

Items run sequentially to bound browser rendering and provider traffic. The
dialog reports the current item and total progress. If one item fails, completed
items stay complete and the action continues from the first unfinished item.
A synchronous guard prevents overlapping submissions from repeated clicks.

Each item still uses its own unique Zernio request ID and consumes normal media,
schedule, provider, and metadata limits. The batch does not bypass ownership,
account membership, TikTok, media-shape, or daily quota checks.

## Source References

- <https://docs.zernio.com/posts/create-post>
- <https://docs.zernio.com/guides/rate-limits>

## File Tree

- web/app/_components/socialPublishing/SocialPublishingBatchQueueDialog.tsx
- web/app/_components/socialPublishing/SocialPublishingTikTokOptions.tsx
- web/lib/clipstitchr/client/queueSocialPublishingBatchItems.ts
- web/lib/clipstitchr/client/scheduleSocialPublishingPost.ts
- web/lib/clipstitchr/server/socialPublishing/requestSocialPublishing.ts
- web/convex/rateLimiter.ts

