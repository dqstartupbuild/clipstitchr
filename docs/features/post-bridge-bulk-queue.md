# Post Bridge Bulk Queue

Dashboard Library selection mode can queue selected saved Stitches or saved
Swipes to Post Bridge without opening each card menu one by one.

## How It Works

The `Select` button in the Stitches and Swipes sections opens the existing batch
selection controls. `Queue selected` appears beside `Delete selected`. The bulk
queue action asks for confirmation, then queues the selected items one at a time.
It waits for each selected item to finish rendering, uploading, and scheduling
before starting the next item.

Bulk queue uses the saved Post Bridge account defaults for each selected item's
product. That keeps the action deterministic and avoids choosing accounts on the
user's behalf. If a selected item's product has no saved Post Bridge accounts,
the run stops with a clear message so the user can save defaults in product
settings.

## Stitch Queueing

Each selected Stitch uses the same media builder as the single-card schedule
dialog. If a rendered Stitch video already exists, it is reused. Otherwise the
browser renders the saved Stitch from its clips and settings. The bulk action
then uploads that MP4 through the existing temporary R2 and Post Bridge media
upload flow, creates a queued Post Bridge post with `use_queue: true`, and lets
the server attach the returned post reference to the Stitch.

## Swipe Queueing

Each selected Swipe uses the dashboard renderer. Bulk queue does not resolve
automatic sounds because that would add hidden sound search/import work to a
single batch click. Without music, Swipes render as image carousels for supported
default platforms. If the product's default accounts include YouTube, the Swipe
renders as a 9:16 MP4 so it can be sent to YouTube Shorts.

## Rate Limits

Bulk queue does not use a new backend endpoint. It consumes the same existing
Post Bridge media upload, schedule create, R2 upload, and Convex metadata update
limits as individual scheduling. The schedule-create per-user minute bucket is
set to Post Bridge's documented per-key cadence, while ClipStitchr still keeps
daily user and global caps to protect app infrastructure.

## Source Files

- `web/app/_components/dashboard/LibraryBatchActionBar.tsx`
- `web/app/_components/dashboard/StitchesSection.tsx`
- `web/app/_components/dashboard/SwiprSwipesSection.tsx`
- `web/lib/clipstitchr/hooks/useLibraryBatchQueue.ts`
- `web/lib/clipstitchr/utils/queueLibraryItemsSequentially.ts`
- `web/lib/clipstitchr/client/createPostBridgeDefaultAccountResolver.ts`
- `web/lib/clipstitchr/client/createStitchPostBridgeScheduleMedia.ts`
- `web/lib/clipstitchr/client/createSwiprPostBridgeScheduleMedia.ts`
- `web/lib/clipstitchr/client/schedulePostBridgePost.ts`
- `docs/backend/rate-limits.md`
