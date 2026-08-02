# Post Bridge Analytics

ClipStitchr has an Analytics page at `/dashboard/analytics` for reviewing the
performance data synced from Post Bridge.

## How It Works

The page loads synced analytics rows for the active product through
`GET /api/post-bridge/analytics?productId=...`. It no longer loads the Post
Bridge posts list because scheduled and posted post status already belongs on
the Schedule page.

Analytics defaults to `Last 30 days`. The user can filter the page by:

- Last 24 hours
- Last 7 days
- Last 30 days
- Last 90 days
- Last 12 months
- All time

ClipStitchr stores a local product mapping when it schedules a Post Bridge post.
Analytics uses that mapping to fetch Post Bridge post-result IDs for the active
product, then asks Post Bridge for analytics rows matching those result IDs.
Both lookups chunk IDs into groups of 100 per Post Bridge request. Every chunk
then follows Post Bridge's `offset`, `limit`, and `meta.total` pagination until
all matching rows have been loaded. Results are deduped by row ID, so neither a
large product nor a post with many platform results truncates silently.
After that product filter, the page filters visible stats and results locally by
each row's `platform_created_at` value. Rows without a valid platform-created
date remain visible in `All time`, but they are excluded from date-limited
ranges because ClipStitchr cannot safely place them in time.

## Sync On Load

Post Bridge only stores analytics snapshots; each row carries a
`last_synced_at` timestamp. There is no cron or background sync — snapshots
refresh when a user loads the page or clicks `Sync analytics`.

`GET /api/post-bridge/analytics` compares the latest `last_synced_at` across the
rows it is about to return against a 15-minute staleness threshold
(`postBridgeAnalyticsStaleThresholdMs`). When post results exist and the
snapshot is missing or older than that, the route tries to consume the
`postBridgeAnalyticsSync` rate limit and, when allowed, calls Post Bridge's
`/v1/analytics/sync` and waits briefly before re-reading: it polls a probe set
(the first 100 post-result IDs) every 2 seconds, up to 4 polls, stopping early
once the probe's latest `last_synced_at` advances past the pre-sync value
(`waitForPostBridgeAnalyticsSync`). When the sync bucket is exhausted, the load
path skips the sync gracefully and still returns the stale snapshot — it never
answers `429`.

The response always includes `analytics`, `lastSyncedAt` (ISO string or null),
`stale`, and `syncTriggered`. The page surfaces this next to the results count:
`Last synced {date}` for fresh snapshots, `Syncing latest metrics…` while a
sync was triggered, and an amber `Metrics may be outdated — automatic sync is
temporarily rate-limited.` warning when the snapshot is stale and the sync was
skipped. The manual `Sync analytics` button (`POST
/api/post-bridge/analytics/sync`) keeps its explicit `429` behavior, uses the
same wait/poll before re-reading, and returns the same enriched shape.

## Pagination

Stat cards and totals are computed over the full filtered set, but the Results
list renders 10 rows per page (`postBridgeListPageSize`) through the shared
`usePagination` hook and `PaginationControls`. Results are sorted by
`platform_created_at`, newest first, before local pagination. Changing the time
range or the active product resets the list to page 1.

## Visible Metrics

The stat cards show:

- Views
- Likes
- Comments
- Shares

Likes, comments, and shares are intentionally split into separate cards so the
page shows the exact engagement shape instead of one combined engagement total.
The Results section uses the same filtered rows and still includes the `Open
post` link when Post Bridge provides a share URL.

## Source References

Post Bridge's
[API reference](https://api.post-bridge.com/reference#tag/Analytics/GET/v1/analytics)
documents `offset` and `limit` pagination with `meta.total`, plus `timeframe`
values of `7d`, `30d`, `90d`, and `all`. ClipStitchr filters locally so it can
also support `Last 24 hours` and `Last 12 months` with the same behavior.

## File Tree

- `web/app/dashboard/analytics/PostBridgeAnalyticsPageClient.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsTimeRangeFilter.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsStatsGrid.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsStatCard.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsResultsSection.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsResultRow.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsMetricCell.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsSyncStatus.tsx`
- `web/convex/postBridgePostProductMappings.ts`
- `web/lib/clipstitchr/constants/postBridgeAnalyticsStaleThresholdMs.ts`
- `web/lib/clipstitchr/constants/postBridgeListPageSize.ts`
- `web/lib/clipstitchr/server/postBridge/filterPostBridgeAnalyticsByPostResultIds.ts`
- `web/lib/clipstitchr/server/postBridge/getLatestPostBridgeAnalyticsSyncedAtMs.ts`
- `web/lib/clipstitchr/server/postBridge/listAllPostBridgePages.ts`
- `web/lib/clipstitchr/server/postBridge/listPostBridgeAnalytics.ts`
- `web/lib/clipstitchr/server/postBridge/listPostBridgePostResults.ts`
- `web/lib/clipstitchr/server/postBridge/waitForPostBridgeAnalyticsSync.ts`
- `web/lib/clipstitchr/types/PostBridgeAnalyticsLoadResult.ts`
- `web/lib/clipstitchr/types/PostBridgeAnalyticsTimeRange.ts`
- `web/lib/clipstitchr/types/PostBridgeAnalyticsTimeRangeOption.ts`
- `web/lib/clipstitchr/utils/filterPostBridgeAnalyticsByTimeRange.ts`
- `web/lib/clipstitchr/utils/getPostBridgeAnalyticsCreatedAtMs.ts`
- `web/lib/clipstitchr/utils/getPostBridgeAnalyticsIsInTimeRange.ts`
- `web/lib/clipstitchr/utils/getPostBridgeAnalyticsTimeRangeCutoffMs.ts`
- `web/lib/clipstitchr/utils/getPostBridgeAnalyticsTotals.ts`
- `web/lib/clipstitchr/utils/postBridgeAnalyticsTimeRangeOptions.ts`
- `web/lib/clipstitchr/utils/defaultPostBridgeAnalyticsTimeRange.ts`
- `web/lib/clipstitchr/utils/sortPostBridgeAnalyticsNewestFirst.ts`
