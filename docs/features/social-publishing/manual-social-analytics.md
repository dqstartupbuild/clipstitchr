# Manual Social Analytics

Analytics reads saved snapshots immediately and never refreshes on page load or
cron. The user chooses product, account, view, and range, then opens the
separate Refresh area to request newer data. The run is durable and shows
progress beside that action. Each run also records the successful owner/global
rate-limit checks, the optional Apify maximum charge, and the number of Apify
runs for support diagnostics without storing provider credentials.

## Views

**Posts published in period** selects publications by `publishedAt` and sums
their latest cumulative snapshot.

**Growth during period** subtracts the closest snapshot at or before the range
start from the newest snapshot at or before the range end. It supports 24
hours, 7 days, 30 days, and custom dates. Missing baselines remain null and the
UI says `Not enough history`. Negative provider corrections stay negative.

Results include per-publication rows and rollups for logical posts, accounts,
products, and all products. The UI says when totals combine platforms or
accounts.

## Sources

TikTok official video query batches at most 20 public IDs. Instagram fetches
metadata, then each media-type-supported insight independently so one
unsupported metric cannot erase the others. Missing values are stored as null.

Optional TikTok save enrichment uses one bounded Apify run for up to 100 URLs
by default. Its default charge cap is USD 0.50 and its hard configurable range
is USD 0.50-2.00. It may fill only TikTok saves; official views, likes,
comments, and shares remain authoritative. Enrichment failure keeps the
official snapshot and marks saves unavailable.

Variables: `SOCIAL_ANALYTICS_TIKTOK_APIFY_ACTOR_ID`,
`SOCIAL_ANALYTICS_APIFY_URL_LIMIT`, and
`SOCIAL_ANALYTICS_APIFY_MAX_TOTAL_CHARGE_USD`.

Code lives in `web/convex/socialAnalytics/`,
`web/services/provider-worker/social/analytics/`, and
`web/app/dashboard/analytics/SocialAnalyticsPageClient.tsx`.
