# Post Bridge Bulk Queue

Dashboard Library selection mode can queue selected saved Stitches or saved
Swipes to Post Bridge without opening each card menu one by one. The user still
reviews each post before it is sent.

## How It Works

The `Select` button in the Stitches and Swipes sections opens the existing batch
selection controls. `Queue selected` appears beside `Delete selected`. The bulk
queue action opens the same Post Bridge schedule dialog used by the individual
`Schedule post` card action.

The dialog preselects the product's saved Post Bridge account defaults when they
exist, but the user can still choose accounts, edit the caption, pick post-now or
queue mode, and adjust any Swipe sound settings before sending that item. After
one selected post finishes, the next selected item opens in a fresh dialog. If
the user cancels a dialog, the remaining selected items are left alone.

Each selected item finishes rendering, uploading, and scheduling before the next
item is shown. That keeps browser work, Post Bridge uploads, and schedule creates
sequential.

## Stitch Queueing

Each selected Stitch uses the same media builder as the single-card schedule
dialog. If a rendered Stitch video already exists, it is reused. Otherwise the
browser renders the saved Stitch from its clips and settings. The user can edit
the caption and account choices in the schedule dialog before that MP4 uploads
through the existing temporary R2 and Post Bridge media upload flow.

## Swipe Queueing

Each selected Swipe uses the dashboard renderer and the same music controls as
individual scheduling. Manual sound and no-sound modes are available inside each
review dialog. Without music, Swipes render as image carousels for supported
platform choices. If the user selects YouTube or chooses a sound, the Swipe
renders as a 9:16 MP4 so the post can include video and audio.

## Rate Limits

Bulk queue does not use a new backend endpoint. It consumes the same existing
Post Bridge media upload, schedule create, R2 upload, and Convex metadata update
limits as individual scheduling, after the user sends each reviewed post. The
schedule-create per-user minute bucket is set to Post Bridge's documented
per-key cadence, while ClipStitchr still keeps daily user and global caps to
protect app infrastructure.

## Source Files

- `web/app/_components/dashboard/LibraryBatchActionBar.tsx`
- `web/app/_components/dashboard/StitchesSection.tsx`
- `web/app/_components/dashboard/SwiprSwipesSection.tsx`
- `web/app/_components/postBridge/PostBridgeScheduleDialog.tsx`
- `web/lib/clipstitchr/hooks/useLibraryBatchScheduleDialog.ts`
- `web/lib/clipstitchr/utils/getLibraryBatchScheduleStatusMessage.ts`
- `web/lib/clipstitchr/client/createStitchPostBridgeScheduleMedia.ts`
- `web/lib/clipstitchr/client/createSwiprPostBridgeScheduleMedia.ts`
- `web/lib/clipstitchr/client/schedulePostBridgePost.ts`
- `docs/backend/rate-limits.md`
