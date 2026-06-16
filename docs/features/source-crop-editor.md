# Source Crop Editor

## Summary

The source crop editor lets users reframe UGC, demo, and saved Stitch source
videos inside the fixed 9:16 output frame. The user taps Crop, drags the video
inside the crop field, adjusts zoom, and saves the change.

Cropping does not change the original uploaded file. It saves crop metadata,
regenerates the preview poster, and uses that metadata the next time
ClipStitchr previews, downloads, or stitches the source.

## Use Cases

- Recenter a person or product after upload normalization.
- Zoom a source clip closer without stretching it.
- Fix a saved Stitch where the UGC or demo source needs different framing.
- Keep the final output vertical while giving users direct control over the
  source framing.

## Implementation

- `web/app/_components/crop/VideoCropEditor.tsx` renders the draggable crop UI.
- `web/lib/clipstitchr/types/QuickEditCrop.ts` stores crop mode, position, and
  zoom.
- `web/lib/clipstitchr/utils/getManualCropForSave.ts` avoids saving default
  crop values.
- `web/lib/clipstitchr/utils/getQuickEditSuggestionsWithCrop.ts` merges manual
  crop metadata with existing quick-edit metadata.
- `web/lib/clipstitchr/utils/getQuickEditCropTransform.ts` keeps live video
  previews visually matched to the saved crop metadata.
- `web/convex/videoClips.ts` stores clip-level crop metadata through
  `videoClips.updateCrop`.
- `web/convex/stitches.ts` stores per-source Stitch crop metadata through
  `stitches.updateSourceCrop`.
- `web/lib/clipstitchr/hooks/useClipLibraryState.ts` saves crop updates,
  regenerates affected clip and Stitch posters, and clears stale saved stitch
  renders.

## Rendering Path

Media rendering reads `quickEdit.crop`, `ugcQuickEdit.crop`, and
`demoQuickEdit.crop`:

- `drawVideoFrameToCanvas` applies crop when capturing posters.
- `copyTextOverlayVideoFramesToSource` applies crop while writing canvas-backed
  video samples.
- `createVideoPosterBlob` applies clip crop metadata when regenerating clip
  preview posters.
- `createVideoSegmentBlob` switches to the canvas path for cropped clip
  downloads.
- `stitchNormalizedVideos`, `stitchNormalizedVideosWithTextOverlay`, and
  `stitchStitchrSequence` switch to the canvas path whenever crop metadata is
  present.

The original output frame remains 9:16. Crop moves and scales the source video
inside that frame instead of resizing the final canvas.

## File Tree

```text
web/app/_components/crop/VideoCropEditor.tsx
web/lib/clipstitchr/types/QuickEditCrop.ts
web/lib/clipstitchr/utils/getManualCropForSave.ts
web/lib/clipstitchr/utils/getQuickEditCropDrawRect.ts
web/lib/clipstitchr/utils/getQuickEditCropTransform.ts
web/lib/clipstitchr/utils/getQuickEditSuggestionsWithCrop.ts
web/lib/clipstitchr/media/createVideoPosterBlob.ts
web/lib/clipstitchr/media/createVideoSegmentBlob.ts
web/lib/clipstitchr/media/drawVideoFrameToCanvas.ts
web/lib/clipstitchr/media/copyTextOverlayVideoFramesToSource.ts
web/convex/videoClips.ts
web/convex/stitches.ts
```

## Abuse Protection

Saving crop metadata uses the existing `convexMetadataUpdate` bucket. When a
clip or Stitch crop changes, the browser regenerates one poster and uploads it
through the existing R2 signed upload path. The old saved Stitch render is
cleared so the next preview or download creates a fresh render with the saved
crop.
