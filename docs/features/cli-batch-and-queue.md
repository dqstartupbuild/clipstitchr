# CLI Batch And Queue Commands

The CLI can now start batch content creation and add finished Stitches to the
Post Bridge queue without opening the dashboard first.

## User Commands

```bash
clipstitchr stitchr batch --product product_123
clipstitchr swipr batch
clipstitchr library clips --kind demo
clipstitchr library stitches --ready
clipstitchr library swipes
clipstitchr queue stitch
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

`clipstitchr queue stitch` adds a finished Stitch to the user's Post Bridge
queue. If no Stitch ID is passed, the CLI lists ready, unposted Stitches and
lets the user pick one. The command never asks for a date or time; the backend
sends `use_queue: true` to Post Bridge.

## Backend Surfaces

```text
web/app/api/cli/library/clips/route.ts
web/app/api/cli/library/stitches/route.ts
web/app/api/cli/library/swipes/route.ts
web/app/api/cli/stitchr/batches/route.ts
web/app/api/cli/swipr/batches/route.ts
web/app/api/cli/queue/stitches/route.ts

web/convex/cliLibrary/
web/convex/cliPostBridge/
web/convex/cliRateLimits/
web/convex/cliSwipr/
```

The CLI routes use the existing machine bearer token from
`getCliSessionFromRequest`. Convex helpers stay owner-scoped and require the
server rate-limit secret, so a CLI token can only read or update the signed-in
owner's records.

## Queue Behavior

The dashboard normally uploads a temporary R2 object to Post Bridge and deletes
that temporary object after upload. CLI queueing starts from a saved Stitch
video, so `uploadPostBridgeMediaFromR2Object` now accepts
`deleteSourceObject: false`. This preserves the user's saved Stitch after Post
Bridge receives the media.

The queue route consumes the same Post Bridge upload-byte and schedule-create
limits as the dashboard before the expensive external calls. After Post Bridge
returns a post, the route records the post reference on the Stitch and marks it
posted. It also stores the local Post Bridge post-to-product mapping so
Schedule and Analytics can show the queued post under the Stitch's product.

## Current Swipe Limitation

Swipr queueing still belongs in the dashboard for now. Saved Swipes are slide
data and background references; the dashboard renders the final images/video in
the browser before scheduling. The CLI can create editable Swipe drafts in
batch, but queueing Swipes from the CLI needs a server-side Swipe renderer so
the backend can produce the same rendered media without a browser DOM.
