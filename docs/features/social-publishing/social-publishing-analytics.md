# Zernio Analytics

The Analytics page at /dashboard/analytics shows Zernio results for posts
created through ClipStitchr.

## How It Works

ClipStitchr stores a local product mapping after each successful Zernio post
creation. GET /api/social-publishing/analytics?productId=... loads those post
IDs, calls GET /v1/analytics?source=late, follows Zernio page and limit
pagination, and keeps rows belonging to the active product.

Zernio returns one post with nested per-platform results. The server normalizes
those results into ClipStitchr's analytics row shape, including views, likes,
comments, shares, platform URL, platform creation time, and last sync time.

The page defaults to the last 30 days and supports 24 hours, 7 days, 30 days,
90 days, 12 months, and all time. Totals use the full filtered result set while
the visible list paginates locally in groups of 10.

## Refresh Behavior

Zernio caches post analytics for 60 minutes and can start a background refresh
when stale analytics are requested. ClipStitchr uses the same 60-minute
freshness threshold. The page has one Refresh analytics action, which calls
POST /api/social-publishing/analytics/sync and then returns the latest rows.
ClipStitchr does not poll a provider-specific sync endpoint.

The refresh route is limited to six requests per hour per owner with a burst of
two. Regular reads retain their own owner and global limits.

## Source References

- <https://docs.zernio.com/analytics/get-analytics>
- <https://docs.zernio.com/guides/rate-limits>

## File Tree

- web/app/dashboard/analytics/SocialPublishingAnalyticsPageClient.tsx
- web/app/dashboard/analytics/SocialPublishingAnalyticsResultsSection.tsx
- web/app/dashboard/analytics/SocialPublishingAnalyticsSyncStatus.tsx
- web/app/api/social-publishing/analytics/route.ts
- web/app/api/social-publishing/analytics/sync/route.ts
- web/lib/clipstitchr/server/socialPublishing/listSocialPublishingAnalytics.ts
- web/lib/clipstitchr/server/socialPublishing/zernio/normalizeZernioPost.ts
- web/convex/socialPublishingPostProductMappings.ts

