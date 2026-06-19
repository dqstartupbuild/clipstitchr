# Stitchr Templates

Stitchr templates let a user save the setup from a finished stitch and reuse it
later without copying the old finished video.

## What It Does

A saved template keeps the editable Stitchr setup:

- source UGC and demo clip ids and names
- normal or Longr mode
- clip trims and sequence segments
- source-audio flags
- playback rates
- shared text overlay data
- shared caption and hashtag copy
- source stitch name and id for context

Templates do not store rendered stitch video files, posters, music assets, or
downloaded media blobs. They are setup records only.

## User Flow

1. Open a saved stitch card.
2. Choose **Save as Template**.
3. The app creates a template from that stitch's current setup.
4. Open Stitchr.
5. Use the Template picker. **None** is the default.
6. Pick a template to load its clips, trims, audio settings, playback rates,
   text, and caption copy.
7. Select different UGC clips if needed. The reused text and caption stay
   available for new UGC clips unless the user gives a specific clip its own
   edit.

The Library **Templates** tab opens at `/dashboard/library?tab=templates`,
where users can see templates, rename them, delete them, and send one back into
Stitchr.

## Implementation

The persistent template table is `stitchTemplates` in
`web/convex/schema.ts`. Records are owner-scoped and indexed by
`ownerId + createdAt` for the Templates page and by `ownerId + id` for single
record access.

Convex functions live in `web/convex/stitchTemplates/`:

- `createFromStitch.ts` saves a template from an owned stitch.
- `list.ts` lists the signed-in user's templates.
- `get.ts` reads one owned template.
- `updateName.ts` renames an owned template.
- `remove.ts` deletes an owned template.
- `createStitchTemplateDocumentFromStitch.ts` copies only reusable setup fields
  from the source stitch.

Client template data flows through:

- `web/lib/clipstitchr/types/StitchTemplate.ts`
- `web/lib/clipstitchr/backend/createStitchTemplateFromConvexDocument.ts`
- `web/lib/clipstitchr/hooks/useStitchTemplates.ts`
- `web/lib/clipstitchr/utils/getStitchTemplateDefaultName.ts`
- `web/lib/clipstitchr/utils/getUseStitchTemplateHref.ts`

The save action is exposed by `StitchCard` and passed through dashboard stitch
sections. The picker is `StitchTemplatePicker`, rendered on
`/dashboard/stitchr`. Template management lives in the Library Templates tab
through `web/app/_components/library/TemplateLibraryTabSection.tsx`, rendered
by `web/app/dashboard/library/LibraryPageClient.tsx`.

## Abuse Protection

Template writes are user-triggered Convex operations:

- `stitchTemplates.createFromStitch` consumes `convexRecordSave`.
- `stitchTemplates.updateName` consumes `convexMetadataUpdate`.
- `stitchTemplates.remove` consumes `convexRecordDelete`.

The list and get queries are authenticated owner-scoped reads. They do not create
storage, bandwidth, provider, or third-party API cost.

## Maintenance Notes

Template application intentionally mirrors the existing "Reuse in Stitchr"
behavior. Normal Stitchr templates place copied text into the reusable text
and caption state instead of tying it to the original UGC clip. That means a
user can deselect the original UGC, move through picker pages, choose new UGC
clips, and still keep the same text and caption on the new stitch outputs.

The URL sync on `/dashboard/stitchr` must only run on initial load and browser
history changes. The in-page Template picker does not rewrite the URL, so reruns
from ordinary library-state changes must not clear reusable template text.
