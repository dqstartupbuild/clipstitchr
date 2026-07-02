# Post Bridge Analytics

ClipStitchr has an Analytics page at `/dashboard/analytics` for reviewing post
performance across Post Bridge posts and manually shared TikTok or Instagram
posts pulled from Apify when the user presses Sync analytics.

## How It Works

The page loads Post Bridge analytics rows through `GET /api/post-bridge/analytics`.
It does not load the Post Bridge posts list because scheduled and posted post
status already belongs on the Schedule page.

The Sync analytics button calls `POST /api/post-bridge/analytics/sync`. That
request refreshes Post Bridge analytics, reads the user's connected Post Bridge
social accounts, and runs the configured TikTok or Instagram Apify actor for
those account usernames. Apify is never run on a timer or hidden background job.

Post Bridge rows are labeled `Post Bridge`. Apify rows are labeled `Manual` and
are deduped against Post Bridge rows by platform post ID and canonical post URL
before the response is returned.

Manual analytics are partial-success only. If Post Bridge analytics refresh but
Apify cannot sync one account, cannot read the account list, or cannot normalize
some actor items, the API returns the Post Bridge rows plus any valid manual
rows and a warning for the manual side. The client keeps the last known good
analytics visible and leaves Sync analytics available for another user-triggered
retry.

Analytics defaults to `Last 30 days`. The user can filter the page by:

- Last 24 hours
- Last 7 days
- Last 30 days
- Last 90 days
- Last 12 months
- All time

The user can also filter by post source:

- All posts
- Post Bridge
- Manual posts

ClipStitchr requests the all-time analytics list from Post Bridge, then filters
the visible stats and results locally by each row's `platform_created_at` value.
Rows without a valid platform-created date remain visible in `All time`, but
they are excluded from date-limited ranges because ClipStitchr cannot safely
place them in time.

## Visible Metrics

The stat cards show:

- Views
- Likes
- Comments
- Shares

Likes, comments, and shares are intentionally split into separate cards so the
page shows the exact engagement shape instead of one combined engagement total.
The Results section uses the same filtered rows and still includes the `Open
post` link when a share URL is available.

## Source References

Post Bridge's `/v1/analytics` API supports `timeframe` values of `7d`, `30d`,
`90d`, and `all`. ClipStitchr filters locally so it can also support `Last 24
hours` and `Last 12 months` with the same behavior.

Manual TikTok and Instagram post analytics use the server-side `APIFY_TOKEN` and
these actor settings:

- `APIFY_TIKTOK_PROFILE_ACTOR_ID`
- `APIFY_INSTAGRAM_PROFILE_ACTOR_ID`

## File Tree

- `web/app/dashboard/analytics/PostBridgeAnalyticsPageClient.tsx`
- `web/app/dashboard/analytics/ContentAnalyticsSourceFilter.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsTimeRangeFilter.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsStatsGrid.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsStatCard.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsResultsSection.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsResultRow.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsMetricCell.tsx`
- `web/app/api/post-bridge/analytics/route.ts`
- `web/app/api/post-bridge/analytics/sync/route.ts`
- `web/lib/clipstitchr/server/apify/syncManualContentAnalyticsForAccounts.ts`
- `web/lib/clipstitchr/types/ContentAnalytics.ts`
- `web/lib/clipstitchr/types/ContentAnalyticsSource.ts`
- `web/lib/clipstitchr/types/ContentAnalyticsSourceFilter.ts`
- `web/lib/clipstitchr/types/PostBridgeAnalyticsSyncResponse.ts`
- `web/lib/clipstitchr/types/PostBridgeAnalyticsTimeRange.ts`
- `web/lib/clipstitchr/types/PostBridgeAnalyticsTimeRangeOption.ts`
- `web/lib/clipstitchr/utils/filterContentAnalyticsBySource.ts`
- `web/lib/clipstitchr/utils/filterPostBridgeAnalyticsByTimeRange.ts`
- `web/lib/clipstitchr/utils/getPostBridgeAnalyticsCreatedAtMs.ts`
- `web/lib/clipstitchr/utils/getPostBridgeAnalyticsIsInTimeRange.ts`
- `web/lib/clipstitchr/utils/getPostBridgeAnalyticsTimeRangeCutoffMs.ts`
- `web/lib/clipstitchr/utils/getPostBridgeAnalyticsTotals.ts`
- `web/lib/clipstitchr/utils/postBridgeAnalyticsTimeRangeOptions.ts`
- `web/lib/clipstitchr/utils/contentAnalyticsSourceFilterOptions.ts`
- `web/lib/clipstitchr/utils/defaultPostBridgeAnalyticsTimeRange.ts`
- `web/lib/clipstitchr/utils/mergeSyncedContentAnalytics.ts`
