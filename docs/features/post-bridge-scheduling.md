# Post Bridge Scheduling

ClipStitchr can post now or schedule saved Stitches and saved Swipes through
Post Bridge. The supported posting targets are TikTok, Instagram, and YouTube
Shorts.

API source reference: `https://api.post-bridge.com/reference#description/introduction`.

## How It Works

Saved Stitches and Swipes show a `Schedule post` action in their card menu.
Their Library sections also expose `Queue selected` while selection mode is
active, letting users add several saved Stitches or Swipes to the Post Bridge
queue in one sequential run.
Users add their own Post Bridge API key in Account settings. The key is tested
against Post Bridge, encrypted server-side, and stored in Convex with only the
last four characters shown back to the browser. The Settings page's Post Bridge
`Config` dialog lets the user link default TikTok, Instagram, and YouTube
accounts to any saved product, no matter which product is currently active.

Disconnecting Post Bridge removes the saved key and clears product-linked
account defaults from products and product cards. That keeps old account IDs
from being reused when someone reconnects with a different Post Bridge account.
Saving a different Post Bridge key also clears those defaults so product picks
do not point at accounts from the previous key.

The schedule dialog loads connected Post Bridge accounts from the server,
filters them to TikTok, Instagram, and YouTube, preselects the accounts linked
to the source product, and still lets the user adjust accounts for that one
post before choosing whether to post now or add it to their Post Bridge queue.
Queued posts use Post Bridge's saved queue settings instead of a ClipStitchr
date picker.

Bulk queue opens one batch dialog for all selected items. The dialog preselects
product-linked Post Bridge accounts when defaults exist, while the user can
change accounts, edit each numbered caption, and use the Swipe sound controls
before confirming once. If an item fails, completed items remain complete and
the dialog can continue from the first unfinished item. Connected accounts are
loaded once for the selected product. Library updates caused by completed items
do not reset the dialog, so progress remains visible and the queue action stays
locked until the batch genuinely completes or fails. A synchronous guard also
blocks a second batch if the action is pressed more than once.

Stitches use the same browser export path as downloads. If the saved stitch has
an existing rendered video, that video is used. Otherwise the browser renders
the stitch from its saved source clips, text, trim, crop, cut, and music
settings before sending the MP4 to the server.

Swipes can schedule either as a rendered image carousel or as a 9:16 MP4
slideshow. When the user schedules to TikTok and Instagram without sound,
ClipStitchr renders each Swipe slide to a PNG and uploads the ordered images to
Post Bridge, matching the carousel approach used by SlideSmith. When a sound is
chosen manually or YouTube Shorts is selected, ClipStitchr renders the Swipe as
a 9:16 MP4 instead so the post has a video asset and any sound is baked in.

Swipe scheduling defaults to no sound. The user can still choose a saved sound,
search TikTok-style sounds, paste a TikTok link, or upload an audio file from
the sound picker before sending the post. ClipStitchr only searches or imports
sound after the user opens that picker and chooses that action.

For saved Swipes, the TikTok and YouTube post title comes from the first
non-empty line of the Swipe's combined caption, description, and hashtag copy.
This keeps the public post title aligned with the headline-style first line users
see in the Swipr copy field. If that copy is empty or only hashtags, ClipStitchr
falls back to the internal saved Swipe name.

When a Swipe is sent to TikTok, ClipStitchr removes that title line from the
TikTok-specific caption configuration before creating the Post Bridge post. This
prevents TikTok from showing the same line as both the title and the first
caption sentence. The schedule dialog still shows the full copy so the user can
edit it in one place before sending.

Post Bridge accepts uploaded media files, not a separate audio attachment for a
post. Because of that, Swipe audio must be included in the rendered video before
the schedule request is sent. When selected sound audio is shorter than the
rendered Swipe or Stitch video, the browser mixer repeats that sound until the
video ends.

## Server Flow

The browser first uploads each rendered PNG image or MP4 video to a temporary
ClipStitchr R2 object through the existing signed R2 upload flow. This keeps
large media out of the Next.js function request body while using ClipStitchr's
own browser-safe R2 CORS configuration.

`POST /api/post-bridge/media/upload` copies each temporary media object to Post
Bridge:

1. Confirms the user is signed in.
2. Reads small JSON metadata and the temporary R2 object reference for one
   rendered media file.
3. Validates that the source Stitch or Swipe belongs to the user.
4. Rejects unsupported media types, image uploads for Stitch posts, and files
   above `POST_BRIDGE_MAX_MEDIA_BYTES`.
5. Consumes Post Bridge upload-byte rate limits before any Post Bridge upload
   starts.
6. Loads the user's encrypted Post Bridge API key from Convex and decrypts it
   only in the Next.js route.
7. Calls `POST /v1/media/create-upload-url`.
8. Streams the temporary R2 object to the returned Post Bridge upload URL
   server-side, where browser CORS preflight does not apply.
9. Returns the Post Bridge `media_id` to the browser.

`POST /api/post-bridge/schedule` handles final scheduling:

1. Confirms the user is signed in.
2. Reads small JSON schedule data and the already uploaded Post Bridge media
   IDs.
3. Validates that the source Stitch or Swipe belongs to the user.
4. Resolves the source product and linked default social account IDs.
5. Rejects mixed image/video submissions, multiple-video submissions, image
   uploads for Stitch posts, image uploads to YouTube Shorts, and files above
   `POST_BRIDGE_MAX_MEDIA_BYTES`.
6. Consumes Post Bridge post-create rate limits.
7. Loads the user's encrypted Post Bridge API key from Convex and decrypts it
   only in the Next.js route.
8. Loads connected Post Bridge accounts and keeps only TikTok, Instagram, and
   YouTube accounts.
9. Verifies the selected account IDs exist on that user's Post Bridge account.
10. Creates the Post Bridge post with `POST /v1/posts`. Queued posts send
   `use_queue: true` and omit `scheduled_at`; immediate posts send
   `scheduled_at: null`.
11. Saves the returned Post Bridge post reference back onto the source stitch or
   swipe, marks that source content posted so it moves out of active drafts,
   and stores a local product mapping for the returned Post Bridge post ID.
12. Captures a consent-gated PostHog server event.

The Post Bridge API uses bearer-token authentication. Because each request uses
the saved user's key, account lists, posts, analytics, media uploads, and
scheduled posts are scoped to that user's Post Bridge account.

Before every Post Bridge API call, the server reserves capacity from a shared
bucket keyed by a SHA-256 hash of that API key. The bucket runs below Post
Bridge's published per-key request rate and waits proactively, so dashboard and
CLI calls using the same key cannot independently burst past the provider
limit. Provider `429` retry and backoff remains a fallback.

Manual Swipe sounds use the existing sound picker. TikTok sound search and import
routes are separately authenticated and rate-limited before Apify and R2 work.

Dashboard bulk queue is intentionally sequential. After one confirmation, each
item uses the same browser media rendering, temporary R2 upload, Post Bridge
media upload, and `POST /api/post-bridge/schedule` flow, then moves to the next
item only after the previous one succeeds. A continued run skips items already
completed in that dialog. Reactive source changes do not reload connected
accounts during the run, which prevents unnecessary Post Bridge read requests
and keeps account-read `429` responses from being amplified by the batch size.

## Analytics

The dashboard sidebar includes `Schedule` at `/dashboard/schedule` and
`Analytics` at `/dashboard/analytics`.

The Schedule page shows Post Bridge posts for the active product and their
scheduled, processing, posted, or failed status. It filters Post Bridge posts
through the local post-to-product mapping saved when ClipStitchr schedules the
post. Queued posts display the `scheduled_at` time returned by Post Bridge when
a queue slot is assigned. Immediate post-now rows display the Post Bridge
`created_at` time, because those posts intentionally have `scheduled_at: null`.
Settings owns the product-level default posting account picker.

The page shows:

- Total synced views.
- Total synced likes.
- Total synced comments.
- Total synced shares.
- Synced TikTok, Instagram, and YouTube Shorts analytics rows with an `Open
  post` link when Post Bridge provides one.

`Sync analytics` calls `POST /api/post-bridge/analytics/sync?productId=...`,
which triggers Post Bridge analytics sync, resolves the active product's mapped
Post Bridge post IDs to Post Bridge post-result IDs, then reloads only matching
analytics rows. Regular refreshes use `GET /api/post-bridge/analytics` with the
same product ID. The Analytics page defaults to `Last 30 days` and can filter
all-time data to the last 12 months, 90 days, 30 days, 7 days, or 24 hours by
each synced row's platform-created date. The Schedule page owns scheduled and
posted post status counts.

## Source Files

- `web/app/_components/postBridge/PostBridgeScheduleDialog.tsx`
- `web/app/_components/dashboard/LibraryBatchActionBar.tsx`
- `web/app/_components/dashboard/StitchesSection.tsx`
- `web/app/_components/dashboard/SwiprSwipesSection.tsx`
- `web/app/_components/postBridge/PostBridgeSoundModePicker.tsx`
- `web/app/_components/settings/SettingsPostBridgePanel.tsx`
- `web/app/_components/settings/SettingsPostBridgeProductConfigDialog.tsx`
- `web/app/_components/settings/PostBridgeProductAccountConfigRow.tsx`
- `web/app/_components/schedule/`
- `web/app/dashboard/schedule/SchedulePageClient.tsx`
- `web/lib/clipstitchr/utils/getPostBridgePostTimeLabel.ts`
- `web/lib/clipstitchr/utils/getSwiprPostBridgeTitle.ts`
- `web/lib/clipstitchr/server/postBridge/removePostBridgeTitleLineFromCaption.ts`
- `web/lib/clipstitchr/server/postBridge/reservePostBridgeProviderRequest.ts`
- `web/convex/postBridgeRateLimits/reservePostBridgeProviderRequest.ts`
- `web/lib/clipstitchr/media/createCliprMixedAudioBuffer.ts`
- `web/lib/clipstitchr/media/createSwiprMusicAudioBuffer.ts`
- `web/lib/clipstitchr/media/scheduleLoopingAudioBuffer.ts`
- `web/app/api/post-bridge/settings/route.ts`
- `web/app/api/post-bridge/media/upload/route.ts`
- `web/app/api/post-bridge/schedule/route.ts`
- `web/app/api/post-bridge/accounts/route.ts`
- `web/app/api/post-bridge/posts/route.ts`
- `web/app/api/post-bridge/analytics/route.ts`
- `web/app/api/post-bridge/analytics/sync/route.ts`
- `web/app/dashboard/analytics/PostBridgeAnalyticsPageClient.tsx`
- `web/convex/postBridgePostProductMappings.ts`
- `web/lib/clipstitchr/server/postBridge/filterPostBridgePostsByMappedPostIds.ts`
- `web/lib/clipstitchr/server/postBridge/filterPostBridgeAnalyticsByPostResultIds.ts`
- `web/lib/clipstitchr/server/postBridge/listPostBridgePostResults.ts`
- `web/convex/clearPostBridgeSocialAccountIdsForOwner.ts`
- `web/lib/clipstitchr/server/postBridge/getPostBridgeApiKeyHasChanged.ts`
- `docs/features/post-bridge-analytics.md`
- `web/lib/clipstitchr/media/renderSwiprSlideBlob.ts`
- `web/lib/clipstitchr/media/renderSwiprSwipeVideoBlob.ts`
- `web/lib/clipstitchr/hooks/useLibraryBatchScheduleDialog.ts`
- `web/lib/clipstitchr/utils/getLibraryBatchScheduleStatusMessage.ts`
- `web/lib/clipstitchr/client/createStitchPostBridgeScheduleMedia.ts`
- `web/lib/clipstitchr/client/createSwiprPostBridgeScheduleMedia.ts`
- `web/lib/clipstitchr/server/postBridge/`
- `web/convex/postBridgeSettings.ts`
- `web/convex/products.ts`
- `web/convex/stitches.ts`
- `web/convex/swipes.ts`
- `web/convex/schema.ts`

## Environment

Required:

- `POST_BRIDGE_API_KEY_ENCRYPTION_SECRET` encrypts user-supplied Post Bridge API
  keys before they are stored.

Optional:

- `POST_BRIDGE_API_BASE_URL` defaults to `https://api.post-bridge.com`.
- `POST_BRIDGE_MAX_MEDIA_BYTES` defaults to 250 MB.

Rate limiting also requires `RATE_LIMIT_API_SECRET`, which is already used by
other protected backend routes.
