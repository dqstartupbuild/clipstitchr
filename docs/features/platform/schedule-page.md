# Schedule Page

ClipStitchr has a Schedule page at `/dashboard/schedule` for reviewing Zernio
posting activity.

## How It Works

The page loads the active product's locally mapped Zernio posts through
`GET /api/social-publishing/posts?productId=...`. It also tries to load supported
TikTok, Instagram, and YouTube accounts through `GET /api/social-publishing/accounts`
so scheduled rows can show account names when possible. Queue-scheduled rows
display Zernio's returned `scheduled_at`, while immediate post-now rows
fall back to Zernio's `created_at` time instead of showing an empty
schedule time.

The user-supplied Zernio API key and product account links live in Settings.
The Schedule page focuses on posting activity only.

## Fetching And Pagination

`listSocialPublishingPosts` follows Zernio's documented `offset`, `limit`, and
`meta.total` pagination until every post has been loaded. There is no fixed page
or post cap. The shared paginator dedupes rows by ID and stops if a provider
page repeats without making progress.

The panel sorts the full list by scheduled (or created) time and renders 10
posts per page (`socialPublishingListPageSize`) through the shared `usePagination`
hook and `PaginationControls`. `ScheduledPostsSummary` still receives the full
list, so status counts stay global across pages.

Zernio's
[API reference](https://docs.zernio.com/posts/list-posts#tag/Posts/GET/v1/posts)
is the source of truth for the posts pagination contract.

## Use Cases

- Check whether a post is scheduled, processing, posted, or failed.
- See which connected accounts a queued post is using.
- Refresh Zernio status without going to Analytics.

When Zernio accepts a post-now or scheduled submission, ClipStitchr marks
the source Stitch or Swipe as posted automatically and stores a local
Zernio-post-to-product mapping. The Schedule page uses that mapping to keep
each product's posting activity separate.

Status badges use the dashboard's warm tonal palette instead of a rainbow of
provider-style colors. Their text labels remain the primary status signal:
scheduled and failed use the accent family, partial and processing use the
shared warning tone, and posted uses the elevated neutral surface. Page errors
use the shared dashboard alert with an icon and alert semantics rather than a
bright red panel.

## Source Files

- `web/app/dashboard/schedule/page.tsx`
- `web/app/dashboard/schedule/SchedulePageClient.tsx`
- `web/app/_components/schedule/ScheduledPostsPanel.tsx`
- `web/app/_components/schedule/ScheduledPostsSummary.tsx`
- `web/app/_components/schedule/ScheduledPostCard.tsx`
- `web/app/_components/schedule/ScheduledPostAccountList.tsx`
- `web/app/_components/schedule/ScheduledPostStatusBadge.tsx`
- `web/convex/socialPublishingPostProductMappings.ts`
- `web/lib/clipstitchr/constants/socialPublishingListPageSize.ts`
- `web/lib/clipstitchr/server/socialPublishing/filterSocialPublishingPostsByMappedPostIds.ts`
- `web/lib/clipstitchr/server/socialPublishing/listAllSocialPublishingPages.ts`
- `web/lib/clipstitchr/server/socialPublishing/listSocialPublishingPosts.ts`
- `web/lib/clipstitchr/utils/getSocialPublishingPostTimeLabel.ts`

## Rate Limits

The page uses existing Zernio read routes. Both account and post reads are
authenticated, resolve the user's encrypted Zernio key server-side, read
the local product mapping, and consume the Zernio read rate limit before
calling Zernio.
