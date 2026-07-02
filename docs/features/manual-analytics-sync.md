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

## User Flow

Users connect Post Bridge first, then choose the accounts they already use for
posting. The analytics page can use those same account usernames for manual
TikTok and Instagram sync. Manual posts appear after Sync analytics finishes.

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
- `web/lib/clipstitchr/server/apify/createManualContentAnalyticsFromApifyItem.ts`
- `web/lib/clipstitchr/server/apify/createTikTokManualContentAnalytics.ts`
- `web/lib/clipstitchr/server/apify/syncManualContentAnalyticsForAccounts.ts`
- `web/lib/clipstitchr/types/ContentAnalytics.ts`
- `web/lib/clipstitchr/utils/filterManualContentAnalyticsAgainstPostBridge.ts`
