# Manual Analytics Sync

Manual analytics sync lets users see TikTok and Instagram post performance for
posts they shared outside ClipStitchr.

## What It Does

When the user presses Sync analytics on `/dashboard/analytics`, ClipStitchr:

1. Refreshes Post Bridge analytics.
2. Reads the connected Post Bridge social accounts.
3. Runs the configured Apify actor for TikTok and Instagram account usernames.
4. Normalizes each Apify post into the same analytics shape used by Post Bridge.
5. Removes rows that match Post Bridge posts by platform post ID or post URL.
6. Returns one combined analytics list to the page.

Apify sync is user-triggered only. There is no cron, background worker, or hidden
periodic refresh.

Post Bridge analytics stay on the page even when manual analytics cannot fully
sync. If Post Bridge refreshes successfully but Apify, connected-account
loading, or item normalization fails, the API still returns the Post Bridge rows
with a manual analytics warning. Valid Apify rows are kept, malformed Apify
items are skipped, and skipped or failed manual work is counted without turning
the whole sync into a failed analytics page.

## User Flow

Users connect Post Bridge first, then choose the accounts they already use for
posting. The analytics page can use those same account usernames for manual
TikTok and Instagram sync. Manual posts appear after Sync analytics finishes.
When a later manual sync has a warning, the page keeps the last known good
manual rows that do not duplicate fresh Post Bridge or fresh manual rows.

The source filter lets users switch between:

- All posts
- Post Bridge
- Manual posts

## Configuration

The Apify API key is read from `APIFY_TOKEN`. The profile actors are configured
separately so the actor choice can change without code changes:

```env
APIFY_TIKTOK_PROFILE_ACTOR_ID=clockworks/tiktok-scraper
APIFY_INSTAGRAM_PROFILE_ACTOR_ID=apify/instagram-scraper
```

## Read Optimization Notes

This feature does not add a Convex subscription or a new recurring read path.
The page still loads Post Bridge analytics through the existing authenticated API
route. Apify only runs inside the explicit sync request, and the combined list is
returned directly to the client.

## File Tree

- `web/app/api/post-bridge/analytics/sync/route.ts`
- `web/lib/clipstitchr/server/apify/createApifyProfileAnalyticsInput.ts`
- `web/lib/clipstitchr/server/apify/createInstagramManualContentAnalytics.ts`
- `web/lib/clipstitchr/server/apify/createManualContentAnalyticsSyncWarning.ts`
- `web/lib/clipstitchr/server/apify/createManualContentAnalyticsFromApifyItem.ts`
- `web/lib/clipstitchr/server/apify/createTikTokManualContentAnalytics.ts`
- `web/lib/clipstitchr/server/apify/syncManualContentAnalyticsForAccount.ts`
- `web/lib/clipstitchr/server/apify/syncManualContentAnalyticsForAccounts.ts`
- `web/lib/clipstitchr/types/ContentAnalytics.ts`
- `web/lib/clipstitchr/types/ManualContentAnalyticsAccountSyncResult.ts`
- `web/lib/clipstitchr/types/ManualContentAnalyticsSyncResult.ts`
- `web/lib/clipstitchr/types/PostBridgeAnalyticsSyncResponse.ts`
- `web/lib/clipstitchr/utils/filterManualContentAnalyticsAgainstPostBridge.ts`
- `web/lib/clipstitchr/utils/mergeSyncedContentAnalytics.ts`
