# Wide Demo Layouts

Wide Demo Layouts keep desktop product demos readable when ClipStitchr
normalizes uploads to vertical 9:16 video.

## What It Does

ClipStitchr supports two upload normalization layouts:

- `crop-fill` fills the vertical frame and crops overflow. It remains the
  default for UGC and mobile-shaped video.
- `fit-with-background` keeps the full source visible in the center and fills
  the vertical frame with a softened version of the same video.

Wide Demo uploads automatically use `fit-with-background`. This preserves app
screens that would lose important controls or text if they were center-cropped.

## Layout Selection

The media worker reads the source dimensions before normalization, then chooses
the layout in this order:

1. Use an explicitly requested `crop-fill` or `fit-with-background` layout.
2. Use `fit-with-background` for Demo video with an aspect ratio of at least
   `1.2`.
3. Use `crop-fill` for every other upload.

Browser uploads also detect wide Demo files before local normalization. They
queue the media-worker path with `fit-with-background` so the full desktop
screen survives the 9:16 conversion.

## Source References

- `web/app/api/uploads/jobs/route.ts`
- `web/lib/clipstitchr/hooks/useUploadProcessor.ts`
- `web/lib/clipstitchr/types/UploadNormalizationLayout.ts`
- `web/lib/clipstitchr/utils/getClipShouldUseUploadBackgroundLayout.ts`
- `web/services/media-worker/createUploadNormalizationFilter.mjs`
- `web/services/media-worker/readUploadNormalizationLayout.mjs`
- `web/services/media-worker/selectUploadNormalizationLayout.mjs`
- `web/services/media-worker/runMediaWorker.mjs`

## Verification

The media-worker tests cover explicit layout selection, automatic wide-Demo
selection, crop behavior for UGC and portrait Demo video, and the generated
ffmpeg filters for both layouts.
