# Schedule Page

ClipStitchr has a Schedule page at `/dashboard/schedule` for reviewing Post
Bridge posting activity.

## How It Works

The page loads the active product's locally mapped Post Bridge posts through
`GET /api/post-bridge/posts?productId=...`. It also tries to load supported
TikTok, Instagram, and YouTube accounts through `GET /api/post-bridge/accounts`
so scheduled rows can show account names when possible. Queue-scheduled rows
display Post Bridge's returned `scheduled_at`, while immediate post-now rows
fall back to Post Bridge's `created_at` time instead of showing an empty
schedule time.

The user-supplied Post Bridge API key and product account links live in Settings.
The Schedule page focuses on posting activity only.

## Fetching And Pagination

`listPostBridgePosts` walks Post Bridge pagination defensively: after each page
it looks for a `next_cursor` / `nextCursor` / `cursor` field on the response and
re-requests with `cursor=<value>` when found, stopping on a missing cursor, an
empty or short page, duplicate post IDs, or a 5-page cap (500 posts). When Post
Bridge returns no cursor field, behavior matches the previous single-page fetch.

The panel sorts the full list by scheduled (or created) time and renders 10
posts per page (`postBridgeListPageSize`) through the shared `usePagination`
hook and `PaginationControls`. `ScheduledPostsSummary` still receives the full
list, so status counts stay global across pages.

## Use Cases

- Check whether a post is scheduled, processing, posted, or failed.
- See which connected accounts a queued post is using.
- Refresh Post Bridge status without going to Analytics.

When Post Bridge accepts a post-now or scheduled submission, ClipStitchr marks
the source Stitch or Swipe as posted automatically and stores a local
Post-Bridge-post-to-product mapping. The Schedule page uses that mapping to keep
each product's posting activity separate.

## Source Files

- `web/app/dashboard/schedule/page.tsx`
- `web/app/dashboard/schedule/SchedulePageClient.tsx`
- `web/app/_components/schedule/ScheduledPostsPanel.tsx`
- `web/app/_components/schedule/ScheduledPostsSummary.tsx`
- `web/app/_components/schedule/ScheduledPostCard.tsx`
- `web/app/_components/schedule/ScheduledPostAccountList.tsx`
- `web/app/_components/schedule/ScheduledPostStatusBadge.tsx`
- `web/convex/postBridgePostProductMappings.ts`
- `web/lib/clipstitchr/constants/postBridgeListPageSize.ts`
- `web/lib/clipstitchr/server/postBridge/filterPostBridgePostsByMappedPostIds.ts`
- `web/lib/clipstitchr/server/postBridge/listPostBridgePosts.ts`
- `web/lib/clipstitchr/utils/getPostBridgePostTimeLabel.ts`

## Rate Limits

The page uses existing Post Bridge read routes. Both account and post reads are
authenticated, resolve the user's encrypted Post Bridge key server-side, read
the local product mapping, and consume the Post Bridge read rate limit before
calling Post Bridge.
