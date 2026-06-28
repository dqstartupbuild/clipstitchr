# Post Bridge Scheduling

ClipStitchr can post now or schedule saved Stitches and saved Swipes through
Post Bridge. The supported posting targets are TikTok, Instagram, and YouTube
Shorts.

API source reference: `https://api.post-bridge.com/reference#description/introduction`.

## How It Works

Saved Stitches and Swipes show a `Schedule post` action in their card menu.
Users add their own Post Bridge API key in Account settings. The key is tested
against Post Bridge, encrypted server-side, and stored in Convex with only the
last four characters shown back to the browser. The Schedule page's
`Config/accounts` tab lets the user link default TikTok, Instagram, and YouTube
accounts to each product.

The schedule dialog loads connected Post Bridge accounts from the server,
filters them to TikTok, Instagram, and YouTube, preselects the accounts linked
to the source product, and still lets the user adjust accounts for that one
post before choosing whether to post now or schedule a future post time.

Stitches use the same browser export path as downloads. If the saved stitch has
an existing rendered video, that video is used. Otherwise the browser renders
the stitch from its saved source clips, text, trim, crop, cut, and music
settings before sending the MP4 to the server.

Swipes can schedule either as a rendered image carousel or as a 9:16 MP4
slideshow. When the user schedules to TikTok and Instagram without sound,
ClipStitchr renders each Swipe slide to a PNG and uploads the ordered images to
Post Bridge, matching the carousel approach used by SlideSmith. When a sound is
selected, automatic sound resolves, or YouTube Shorts is selected, ClipStitchr
renders the Swipe as a 9:16 MP4 instead so the post has a video asset and any
sound is baked in.

Swipe scheduling defaults to automatic sound. It first uses a matching saved
sound. If no saved sound is available and the one-time sound confirmation has
been accepted, it searches TikTok from the Swipe title, product context, and
caption, imports the best result, and mixes it into the rendered Swipe video in
the browser before upload. If automatic sound cannot resolve a usable track, the
post can still continue without sound and use the image-carousel path when the
selected platforms allow images. The user can still switch to choosing a sound
manually or using no sound.

Post Bridge accepts uploaded media files, not a separate audio attachment for a
post. Because of that, Swipe audio must be included in the rendered video before
the schedule request is sent. When selected sound audio is shorter than the
rendered Swipe or Stitch video, the browser mixer repeats that sound until the
video ends.

## Server Flow

`POST /api/post-bridge/schedule` handles scheduling:

1. Confirms the user is signed in.
2. Reads the uploaded media files and schedule form data.
3. Validates that the source stitch or swipe belongs to the user.
4. Resolves the source product and linked default social account IDs.
5. Rejects unsupported media types, mixed image/video uploads, multiple-video
   uploads, image uploads for Stitch posts, image uploads to YouTube Shorts, and
   files above `POST_BRIDGE_MAX_MEDIA_BYTES`.
6. Consumes Post Bridge schedule and upload-byte rate limits.
7. Loads the user's encrypted Post Bridge API key from Convex and decrypts it
   only in the Next.js route.
8. Loads connected Post Bridge accounts and keeps only TikTok, Instagram, and
   YouTube accounts.
9. Verifies the selected account IDs exist on that user's Post Bridge account.
10. Uploads the rendered PNG image carousel or MP4 video through
   `POST /v1/media/create-upload-url` and the returned signed upload URLs.
11. Creates the Post Bridge post with `POST /v1/posts`. Scheduled posts send an
   ISO `scheduled_at`; immediate posts send `scheduled_at: null`.
12. Saves the returned Post Bridge post reference back onto the source stitch or
   swipe and marks that source content posted so it moves out of active drafts.
13. Captures a consent-gated PostHog server event.

The Post Bridge API uses bearer-token authentication. Because each request uses
the saved user's key, account lists, posts, analytics, media uploads, and
scheduled posts are scoped to that user's Post Bridge account.

Automatic Swipe sounds use the existing TikTok sound search and import routes,
which are separately authenticated and rate-limited before Apify and R2 work.

## Analytics

The dashboard sidebar includes `Schedule` at `/dashboard/schedule` and
`Analytics` at `/dashboard/analytics`.

The Schedule page shows Post Bridge posts and their scheduled, processing,
posted, or failed status. Scheduled posts display their `scheduled_at` time.
Immediate post-now rows display the Post Bridge `created_at` time, because those
posts intentionally have `scheduled_at: null`. Its `Config/accounts` tab owns
the product-level default posting account picker.

The page shows:

- Total synced views.
- Total synced likes.
- Total synced comments.
- Total synced shares.
- Synced TikTok, Instagram, and YouTube Shorts analytics rows with an `Open
  post` link when Post Bridge provides one.

`Sync analytics` calls `POST /api/post-bridge/analytics/sync`, which triggers
Post Bridge analytics sync, then reloads the returned analytics rows. Regular
refreshes use `GET /api/post-bridge/analytics`. The Analytics page defaults to
`Last 30 days` and can filter all-time data to the last 12 months, 90 days, 30
days, 7 days, or 24 hours by each synced row's platform-created date. The
Schedule page owns scheduled and posted post status counts.

## Source Files

- `web/app/_components/postBridge/PostBridgeScheduleDialog.tsx`
- `web/app/_components/postBridge/PostBridgeAutomaticSoundStatus.tsx`
- `web/app/_components/postBridge/PostBridgeSoundModePicker.tsx`
- `web/app/_components/settings/SettingsPostBridgePanel.tsx`
- `web/app/_components/settings/ProductPostBridgeAccountsPanel.tsx`
- `web/app/_components/schedule/`
- `web/app/dashboard/schedule/SchedulePageClient.tsx`
- `web/lib/clipstitchr/utils/getPostBridgePostTimeLabel.ts`
- `web/lib/clipstitchr/media/createCliprMixedAudioBuffer.ts`
- `web/lib/clipstitchr/media/createSwiprMusicAudioBuffer.ts`
- `web/lib/clipstitchr/media/scheduleLoopingAudioBuffer.ts`
- `web/app/api/post-bridge/settings/route.ts`
- `web/app/api/post-bridge/schedule/route.ts`
- `web/app/api/post-bridge/accounts/route.ts`
- `web/app/api/post-bridge/posts/route.ts`
- `web/app/api/post-bridge/analytics/route.ts`
- `web/app/api/post-bridge/analytics/sync/route.ts`
- `web/app/dashboard/analytics/PostBridgeAnalyticsPageClient.tsx`
- `docs/features/post-bridge-analytics.md`
- `web/lib/clipstitchr/media/renderSwiprSlideBlob.ts`
- `web/lib/clipstitchr/media/renderSwiprSwipeVideoBlob.ts`
- `web/lib/clipstitchr/hooks/useAutomaticPostBridgeSound.ts`
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
