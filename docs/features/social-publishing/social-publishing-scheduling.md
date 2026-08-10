# Zernio Scheduling

ClipStitchr uses a user-owned Zernio API key to publish finished Stitches and
Swipes to TikTok, Instagram, and YouTube. ClipStitchr does not own the social
connection or billing relationship. Users connect and pay for accounts in
Zernio, then give ClipStitchr a profile-scoped read-write key.

Zernio includes the first two connected accounts at no cost. Current pricing is
documented at <https://zernio.com/pricing>.

## Setup

1. Create or sign in to a Zernio account.
2. Connect social accounts in Zernio.
3. Create a profile-scoped read-write API key under Settings and API Keys.
4. Paste the key into ClipStitchr Account settings.
5. Choose default accounts for each ClipStitchr product.

The full key is tested against GET /v1/accounts, encrypted in the Next.js
runtime, and stored in Convex. It is never returned to the browser after save.
Changing or removing a key clears saved product account IDs so another Zernio
workspace cannot inherit stale defaults.

Legacy database fields and tables remain schema-declared during rollout so
existing documents continue to validate, but no Zernio route reads an old
provider key, account ID, post reference, or product mapping. Users must make a
fresh Zernio connection.

## Posting Flow

The schedule dialog loads accounts from GET /v1/accounts, keeps supported
TikTok, Instagram, and YouTube accounts, and preselects the source product's
defaults. Users can change the account choices, caption, sound, and delivery
mode before submitting.

TikTok accounts are enriched with
GET /v1/accounts/{accountId}/tiktok/creator-info. The dialog disables accounts
that need reconnection, have reached TikTok's daily limit, or cannot return
creator settings. Before a TikTok submission, the user must choose an allowed
privacy level, identify promotional content, and explicitly approve the post.
Consent resets after relevant post or account choices change.

Media moves through these stages:

1. The browser renders PNG carousel images or one MP4.
2. The browser uploads each file to a temporary owner-scoped R2 object.
3. POST /api/social-publishing/media/upload verifies ownership and media
   constraints, calls POST /v1/media/presign, and uploads to its signed URL.
4. POST /api/social-publishing/schedule verifies the selected accounts and
   creates the Zernio post with POST /v1/posts.
5. ClipStitchr saves the Zernio post ID and local product mapping.

Each create request carries a unique x-request-id. Zernio can return either
post or existingPost, so a same-request retry does not create a duplicate.
Queue submissions use queuedFromProfile; immediate submissions use publishNow.
Media is sent in mediaItems, and per-account settings are sent in platforms.

Swipr image posts are rendered at Instagram's 1080 x 1350 feed size when
Instagram is the only destination. Cross-platform image posts keep the shared
1080 x 1920 media and send a separate 1080 x 1350 image set through Zernio's
per-platform `customMedia` field for Instagram. This preserves TikTok's
vertical layout without sending Instagram an unsupported 9:16 feed image.

## Supported Media

- Stitches publish as one MP4.
- Swipes publish as ordered PNG carousel images when the selected platforms
  support that shape and no rendered audio is needed.
- Swipes publish as one 9:16 MP4 when YouTube is selected or sound must be
  included.
- Mixed image and video payloads, multiple videos, Stitch images, and YouTube
  image posts are rejected before provider work.

## Security and Abuse Protection

Authorization and ownership checks are separate from rate limits. Provider
requests share a bucket keyed by a SHA-256 hash of the saved key. The bucket
uses Zernio's free-tier floor of 60 requests per minute, while provider 429
responses honor Retry-After with bounded retries.

Schedule creation is capped at 15 per hour and 50 per day per ClipStitchr owner.
Media byte, R2, global schedule, and Convex metadata limits still apply. See
docs/operations/security/rate-limits.md.

## Source References

- <https://docs.zernio.com/>
- <https://docs.zernio.com/posts/create-post>
- <https://docs.zernio.com/accounts/get-tiktok-creator-info>
- <https://docs.zernio.com/guides/media-uploads>
- <https://docs.zernio.com/guides/rate-limits>

## File Tree

- web/app/_components/socialPublishing/SocialPublishingScheduleDialog.tsx
- web/app/_components/socialPublishing/SocialPublishingTikTokOptions.tsx
- web/app/api/social-publishing/accounts/route.ts
- web/app/api/social-publishing/media/upload/route.ts
- web/app/api/social-publishing/schedule/route.ts
- web/lib/clipstitchr/client/createSwiprSocialPublishingScheduleMedia.ts
- web/lib/clipstitchr/server/socialPublishing/groupSocialPublishingMedia.ts
- web/lib/clipstitchr/server/socialPublishing/createSocialPublishingPost.ts
- web/lib/clipstitchr/server/socialPublishing/listSocialPublishingSocialAccounts.ts
- web/lib/clipstitchr/server/socialPublishing/zernio/
- web/lib/clipstitchr/utils/getSwiprSocialPublishingImageRenderTargets.ts
- web/convex/socialPublishingSettings.ts
- web/convex/socialPublishingPostProductMappings.ts

## Environment

- SOCIAL_PUBLISHING_API_KEY_ENCRYPTION_SECRET encrypts saved user keys.
- ZERNIO_API_BASE_URL defaults to https://zernio.com/api/v1.
- SOCIAL_PUBLISHING_MAX_MEDIA_BYTES defaults to 250 MiB.
- RATE_LIMIT_API_SECRET authorizes server-side limiter calls to Convex.
