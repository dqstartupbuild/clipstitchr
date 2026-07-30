# Analytics Page

`/dashboard/analytics` reads the selected in-house social provider's saved
analytics snapshots. Loading or filtering the page never calls TikTok,
Instagram, or Apify.

The results workspace and the refresh workspace are separate. Users can inspect
the latest saved results first, then deliberately open `Refresh analytics` when
they want a provider update. The durable run shows progress and partial
failures beside that action.

Filters include product, account, view, and 24-hour, 7-day, 30-day, or custom
dates. `Posts published in period` sums the latest cumulative metrics for posts
published in the range. `Growth during period` compares snapshots and says
`Not enough history` when no baseline exists. Missing metrics render as
unavailable, never as zero.

The page includes publication detail plus logical-post, account, product, and
all-products rollups. Combined totals say when more than one platform or account
is included.

With `SOCIAL_PUBLISHING_PROVIDER=in_house`,
`/dashboard/analytics?legacy=1` exposes retained Post Bridge analytics as
read-only history. Its load path never triggers a provider sync.

Source files:

- `web/app/dashboard/analytics/page.tsx`
- `web/app/dashboard/analytics/SocialAnalyticsPageClient.tsx`
- `web/app/_components/social/SocialAnalyticsFilters.tsx`
- `web/app/_components/social/SocialAnalyticsRefreshPanel.tsx`
- `web/app/_components/social/SocialAnalyticsPublicationList.tsx`
- `web/convex/socialAnalytics/getSocialAnalyticsReport.ts`
- `web/convex/socialAnalytics/createSocialAnalyticsRefreshRun.ts`

Metric semantics and sources are documented in
`docs/features/social-publishing/manual-social-analytics.md`.
