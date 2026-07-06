# Schedule Page

ClipStitchr has a Schedule page at `/dashboard/schedule` for reviewing Post
Bridge posting activity and managing the product-level posting account defaults.

## How It Works

The page has two tabs:

- `Scheduled content` loads the active product's locally mapped Post Bridge
  posts through `GET /api/post-bridge/posts?productId=...`. It also tries to
  load supported TikTok, Instagram, and YouTube accounts through
  `GET /api/post-bridge/accounts` so scheduled rows can show account names when
  possible. Queue-scheduled rows display Post Bridge's returned `scheduled_at`,
  while immediate post-now rows fall back to Post Bridge's `created_at` time
  instead of showing an empty schedule time.
- `Config/accounts` shows the product-level Post Bridge account picker for the
  active product. This is the same account linking control that used to live in
  product settings. It saves default Post Bridge social account IDs to the
  active product through Convex.

The user-supplied Post Bridge API key still lives in account settings. The
Schedule page focuses on posting activity and product-specific posting account
choices.

## Use Cases

- Check whether a post is scheduled, processing, posted, or failed.
- See which connected accounts a queued post is using.
- Refresh Post Bridge status without going to Analytics.
- Choose the default TikTok, Instagram, and YouTube accounts for the active
  product before posting or scheduling new Stitches and Swipes.

When Post Bridge accepts a post-now or scheduled submission, ClipStitchr marks
the source Stitch or Swipe as posted automatically and stores a local
Post-Bridge-post-to-product mapping. The Schedule page uses that mapping to keep
each product's posting activity separate.

## Source Files

- `web/app/dashboard/schedule/page.tsx`
- `web/app/dashboard/schedule/SchedulePageClient.tsx`
- `web/app/_components/schedule/SchedulePageTabs.tsx`
- `web/app/_components/schedule/ScheduledPostsPanel.tsx`
- `web/app/_components/schedule/ScheduledPostsSummary.tsx`
- `web/app/_components/schedule/ScheduledPostCard.tsx`
- `web/app/_components/schedule/ScheduledPostAccountList.tsx`
- `web/app/_components/schedule/ScheduledPostStatusBadge.tsx`
- `web/app/_components/schedule/ScheduleAccountsPanel.tsx`
- `web/app/_components/settings/ProductPostBridgeAccountsPanel.tsx`
- `web/convex/postBridgePostProductMappings.ts`
- `web/lib/clipstitchr/server/postBridge/filterPostBridgePostsByMappedPostIds.ts`
- `web/lib/clipstitchr/types/SchedulePageTab.ts`
- `web/lib/clipstitchr/utils/getInitialSchedulePageTab.ts`
- `web/lib/clipstitchr/utils/getPostBridgePostTimeLabel.ts`
- `web/lib/clipstitchr/utils/getSchedulePageTabFromSearchParams.ts`

## Rate Limits

The page uses existing Post Bridge read routes. Both account and post reads are
authenticated, resolve the user's encrypted Post Bridge key server-side, read
the local product mapping, and consume the Post Bridge read rate limit before
calling Post Bridge.
