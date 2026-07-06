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
After that product filter, the page filters visible stats and results locally by
each row's `platform_created_at` value. Rows without a valid platform-created
date remain visible in `All time`, but they are excluded from date-limited
ranges because ClipStitchr cannot safely place them in time.

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

Post Bridge's `/v1/analytics` API supports `timeframe` values of `7d`, `30d`,
`90d`, and `all`. ClipStitchr filters locally so it can also support `Last 24
hours` and `Last 12 months` with the same behavior.

## File Tree

- `web/app/dashboard/analytics/PostBridgeAnalyticsPageClient.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsTimeRangeFilter.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsStatsGrid.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsStatCard.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsResultsSection.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsResultRow.tsx`
- `web/app/dashboard/analytics/PostBridgeAnalyticsMetricCell.tsx`
- `web/convex/postBridgePostProductMappings.ts`
- `web/convex/postBridgePostProductMappingBackfills.ts`
- `web/lib/clipstitchr/server/postBridge/filterPostBridgeAnalyticsByPostResultIds.ts`
- `web/lib/clipstitchr/server/postBridge/listPostBridgePostResults.ts`
- `web/lib/clipstitchr/types/PostBridgeAnalyticsTimeRange.ts`
- `web/lib/clipstitchr/types/PostBridgeAnalyticsTimeRangeOption.ts`
- `web/lib/clipstitchr/utils/filterPostBridgeAnalyticsByTimeRange.ts`
- `web/lib/clipstitchr/utils/getPostBridgeAnalyticsCreatedAtMs.ts`
- `web/lib/clipstitchr/utils/getPostBridgeAnalyticsIsInTimeRange.ts`
- `web/lib/clipstitchr/utils/getPostBridgeAnalyticsTimeRangeCutoffMs.ts`
- `web/lib/clipstitchr/utils/getPostBridgeAnalyticsTotals.ts`
- `web/lib/clipstitchr/utils/postBridgeAnalyticsTimeRangeOptions.ts`
- `web/lib/clipstitchr/utils/defaultPostBridgeAnalyticsTimeRange.ts`

Legacy posts scheduled before product-scoped Analytics existed need the
operator-only `postBridgePostProductMappingBackfills` backfill documented in
`docs/features/post-bridge-scheduling.md` before their analytics can be matched
to the active product.
