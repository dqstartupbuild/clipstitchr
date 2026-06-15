# Saved Stitch Renders

Saved Stitch renders make a saved Stitch behave like a real finished video, not
only an editable setup.

## What It Does

When a user creates a manual Stitch, ClipStitchr renders the finished vertical
MP4 in the browser, uploads it to R2, and saves the render on the Stitch record.
The library can then preview, download, and score the exact finished video.

Older Stitches may not have a saved render yet. When the user previews,
downloads, or scores one of those Stitches, ClipStitchr renders it from the
saved setup, uploads the MP4, saves the R2 object reference, and then uses that
saved video for the requested action.

## User Behavior

- Creating a Stitch now saves a finished video asset.
- Opening Stitch details plays the saved finished video.
- Editing a Stitch still loads the source UGC/demo clips because edit mode needs
  the original source setup.
- Downloading a Stitch uses the saved finished video and adds poster metadata to
  the downloaded file.
- Scoring a Stitch makes sure a saved finished video exists before asking for a
  score.

## Stale Render Rules

ClipStitchr clears the saved render when an edit changes the finished video:

- source UGC or demo clip changes
- trim changes
- playback speed changes
- text overlay changes
- music is added, removed, enabled, disabled, or volume-changed

The next preview, download, or score regenerates and saves a fresh render.

## Implementation

Render helpers:

- `web/lib/clipstitchr/client/createRenderedStitchVideoUpload.ts` renders the
  Stitch with the existing export path, uploads the MP4 as `stitch-video`, and
  returns the R2 object reference plus blob metadata.
- `web/lib/clipstitchr/client/saveRenderedStitchVideo.ts` renders/uploads and
  persists the R2 object through `stitches.updateRenderedVideo`.
- `web/lib/clipstitchr/client/createStitchExportBlob.ts` now prefers an
  existing `stitch.blob` or `stitch.stitchObject` before rendering from source
  clips.

Create flow:

- `web/lib/clipstitchr/hooks/useStitchr.ts` renders/uploads new manual Stitches
  during creation.
- If selected shared music is already known, it is included before the first
  save and the saved render includes it.
- If generated music is requested, the editable Stitch is saved first, music is
  generated and attached, then the final render is saved.

Library flow:

- `web/lib/clipstitchr/hooks/useClipLibraryState.ts` exposes
  `loadStitchVideo`.
- `StitchCard` uses `loadStitchVideo` for details preview and download.
- `StitchEditDialog` still uses source clip loading for edit preview.
- `SavedStitchVideoPreview` plays the saved rendered MP4 in Stitch details.

Server state:

- `stitches.updateRenderedVideo` stores `stitchObject`, `mimeType`, and `size`.
- `stitches.updateSourceSettings`, `stitches.updateTextOverlay`, and
  `stitches.updateMusic` clear `stitchObject`, `mimeType`, `size`, and any saved
  Stitch Score when the final video changes.

## Abuse Protection

Saved render creation uses existing protected surfaces:

- R2 upload signed URL and byte buckets protect the uploaded MP4.
- R2 download signed URL buckets protect source media and saved render reads.
- `convexMetadataUpdate` protects `stitches.updateRenderedVideo` and render
  clearing mutations.

No provider model is called for rendering. It is browser-side Media Bunny work
plus R2 storage.
