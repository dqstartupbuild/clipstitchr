# Zernio Analytics

The Analytics page at `/dashboard/analytics` shows performance for every post
Zernio knows about on the social accounts linked to the active ClipStitchr
product. That includes posts published through ClipStitchr and posts published
directly on the connected channels.

## User Experience

The page separates three analytics jobs:

- **Overview** leads with views, reach, impressions, average engagement, saves,
  and link clicks. It then shows engagement received over time and a comparable
  per-platform table.
- **Strategy** shows Zernio's best posting windows, follower growth, strongest
  observed weekly posting cadence, and content lifespan.
- **Posts** lists every individual result with its account, origin, public URL,
  and the full common metric set: views, reach, impressions, likes, comments,
  shares, saves, and clicks.

The time-range control applies to Overview and Posts. Strategy uses all history
available from Zernio because its recommendations need a larger sample.

## Account Scope

Each ClipStitchr product stores the Zernio social account IDs assigned to it.
The analytics API verifies that those accounts are still active and connected,
then limits every result to that set. If every selected account belongs to the
same Zernio profile, aggregate insight requests use one profile query. A partial
profile selection uses account-level queries so another product's accounts are
not mixed into the result.

No Zernio API key or provider response is stored in the browser. The server
decrypts the signed-in owner's key only for the request.

## Post Coverage

`GET /api/social-publishing/analytics?productId=...` calls
`GET /v1/analytics` with `source=all`, follows Zernio's `page` and `limit`
pagination, and keeps results for the active product's accounts. `source=all`
includes both Zernio-created posts and external posts imported from the social
platform.

Zernio can return a current `platformAnalytics` array or an older `platforms`
array. ClipStitchr supports both and accepts the documented `postId`, legacy
`_id`, and `latePostId` identifiers. Each per-platform result is normalized to
one row.

Zernio background-syncs external posts for supported connected accounts about
every 90 minutes. The explicit **Refresh analytics** action calls
`POST /v1/posts/sync-external` once per selected account before reloading the
dashboard. A failed account refresh does not erase existing results. The page
shows a warning and keeps the last data Zernio returned.

LinkedIn personal profiles are the main exception. Zernio requires a specific
post URL to import those posts on demand, so a general account refresh cannot
discover them. LinkedIn organization pages and platforms with listing APIs can
be refreshed without a post URL. Platform analytics can also arrive later than
the post itself. Instagram reach and impressions, for example, may take about a
day.

## Zernio Insight Endpoints

The server loads independent insight sections in parallel. One unavailable
section does not hide the rest of the dashboard.

| Insight | Zernio endpoint | ClipStitchr use |
| --- | --- | --- |
| Engagement trend | `GET /v1/analytics/daily-metrics?attribution=received` | Shows when engagement arrived, including gains on older posts |
| Best posting time | `GET /v1/analytics/best-time` | Ranks day-and-hour windows in UTC by historical engagement |
| Content lifespan | `GET /v1/analytics/content-decay` | Shows the share of final engagement earned in each age window |
| Posting cadence | `GET /v1/analytics/posting-frequency` | Finds the observed posts-per-week rate with the strongest engagement by platform |
| Follower growth | `GET /v1/accounts/follower-stats` | Shows current followers and daily growth per selected account |

These endpoints require Zernio's Analytics add-on. Some platform-specific
permissions may also be required. If an endpoint returns an add-on or permission
error, ClipStitchr identifies the missing section and leaves the working
sections available.

ClipStitchr intentionally does not mix Zernio's separate ad analytics, inbox
analytics, or platform-only reports such as YouTube retention and Instagram
demographics into this unified post workspace. Those reports have different
permissions, date limits, metric definitions, and user jobs. They should get
their own focused view if added later.

## Refresh And Abuse Protection

Regular analytics reads consume the existing Zernio read limits: 120 per hour
per owner with a burst of 30, plus 1,000 per hour globally with a burst of 200.
Every provider request also passes through the API-key-hashed provider pacing
bucket set to 60 requests per minute with a burst of two.

The explicit refresh route is limited to six refreshes per hour per owner with
a burst of two, plus 200 per hour globally with a burst of 40. The limit is
consumed before external account synchronization or analytics requests begin.
HTTP rate-limit failures return `429` with retry timing through the shared rate
limit response.

## Source References

- <https://docs.zernio.com/analytics/get-analytics>
- <https://docs.zernio.com/analytics/sync-external-posts>
- <https://docs.zernio.com/analytics/get-daily-metrics>
- <https://docs.zernio.com/analytics/get-best-time-to-post>
- <https://docs.zernio.com/analytics/get-content-decay>
- <https://docs.zernio.com/analytics/get-posting-frequency>
- <https://docs.zernio.com/accounts/get-follower-stats>
- <https://docs.zernio.com/guides/rate-limits>

## File Tree

- `web/app/dashboard/analytics/` contains the Overview, Strategy, Posts, chart,
  table, state, filter, and navigation components.
- `web/app/api/social-publishing/analytics/route.ts` serves normal reads.
- `web/app/api/social-publishing/analytics/sync/route.ts` handles explicit
  external-post refreshes.
- `web/lib/clipstitchr/server/socialPublishing/listSocialPublishingAnalytics.ts`
  normalizes paginated post analytics.
- `web/lib/clipstitchr/server/socialPublishing/loadSocialPublishing*` files load
  one Zernio insight each.
- `web/lib/clipstitchr/types/SocialPublishing*` files define the normalized
  analytics contracts.
- `web/lib/clipstitchr/utils/` contains focused filtering, totals, chart, and
  recommendation helpers.
