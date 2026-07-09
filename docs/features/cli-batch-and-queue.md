# CLI Batch And Queue Commands

The CLI can start batch content creation and add ready active Stitches or
Swipes to the Post Bridge queue without opening the dashboard first.

## User Commands

```bash
clipstitchr stitchr batch --product product_123
clipstitchr swipr batch
clipstitchr queue stitch
clipstitchr queue stitch stitch_123
clipstitchr queue stitch --all
clipstitchr queue swipe
clipstitchr queue swipe swipe_123
clipstitchr queue swipe --all
clipstitchr queue --all
```

`clipstitchr stitchr batch` starts today's Stitchr Batch for the connected
account and product. It uses the existing backend Stitchr Batch planner, recent
UGC/Demo clips from that product, optional template/sound IDs, the user's local
time zone, and the provider worker to finish text and media. The command uses
the saved project product from `clipstitchr init` or `clipstitchr products use`;
`--product` overrides it for one run.

`clipstitchr swipr batch` starts Swipr draft creation through an on-demand
durable CLI planner. This uses the user's saved dashboard batch settings for
Pexels packs, draft count, and text styling. The CLI can pass a product ID, but
it does not ask for manual slide details because the agreed UX is batch-only.

CLI-started Stitchr and Swipr batches appear in the dashboard background-work
banner and job tray while they are active. The banner reuses the same active job
UI as uploads, but the rows are read from automation task summaries and grouped
by batch run. Progress is the share of batch tasks that have reached a terminal
state.

`clipstitchr queue stitch` adds the latest ready active Stitch to the user's
Post Bridge queue. Passing a Stitch ID keeps the old script-friendly behavior.
`clipstitchr queue stitch --all` queues all ready active Stitches sequentially.

`clipstitchr queue swipe` adds the latest ready active Swipe with a saved
rendered image to the user's Post Bridge queue. Passing a Swipe ID queues that
specific Swipe, and `clipstitchr queue swipe --all` queues all ready active
Swipes sequentially. `clipstitchr queue --all` mixes ready Stitches and Swipes
in a randomized order, then queues them one at a time. Bulk commands report each
success and each failure so the user can see what still needs attention. None
of the queue commands ask for a date or time; the backend sends
`use_queue: true` to Post Bridge.

## Backend Surfaces

```text
web/app/api/cli/library/clips/route.ts
web/app/api/cli/library/stitches/route.ts
web/app/api/cli/library/swipes/route.ts
web/app/api/cli/stitchr/batches/route.ts
web/app/api/cli/swipr/batches/route.ts
web/app/api/cli/queue/stitches/route.ts
web/app/api/cli/queue/swipes/route.ts

web/convex/createActiveAutomationBatchJobSummary.ts
web/convex/getAutomationBatchJobProgress.ts
web/convex/getAutomationBatchJobStage.ts
web/convex/getAutomationBatchJobStatus.ts
web/convex/getAutomationBatchJobType.ts
web/convex/listActiveAutomationBatchJobSummaries.ts
web/convex/cliLibrary/
web/convex/cliPostBridge/
web/convex/cliRateLimits/
web/convex/cliSwipr/
```

The CLI routes use the existing machine bearer token from
`getCliSessionFromRequest`. Convex helpers stay owner-scoped and require the
server rate-limit secret, so a CLI token can only read or update the signed-in
owner's records.

`activeWorkerJobs.summary` combines active provider jobs, media jobs, and active
CLI batch automation task groups. This keeps CLI-started batch progress visible
without adding another dashboard subscription.

## Notifications

Completed Swipr CLI batches use the normal automation-run notification path.
Completed Stitchr Batch tasks use the existing Stitchr Batch notification path,
so the user gets a notification when the whole batch finishes.

## Queue Behavior

The dashboard normally uploads a temporary R2 object to Post Bridge and deletes
that temporary object after upload. CLI queueing starts from saved media, so
`uploadPostBridgeMediaFromR2Object` accepts `deleteSourceObject: false`. This
preserves the user's saved Stitch video or Swipe image after Post Bridge
receives the media.

The Stitch queue route requires a finished saved R2 video. The Swipe queue
route requires a saved rendered image, which is currently the saved Swipe
preview image. Full carousel or music-backed video rendering still happens in
the dashboard because it uses browser canvas rendering. If a user needs the full
Swipe carousel/video output, they should open the dashboard and queue it there.

The queue routes consume the same Post Bridge upload-byte and schedule-create
limits as the dashboard before the expensive external upload/create calls. After
Post Bridge returns a post, the route records the post reference on the Stitch
or Swipe and marks it posted. It also stores the local Post Bridge
post-to-product mapping so Schedule and Analytics can show the queued post under
the source product.
