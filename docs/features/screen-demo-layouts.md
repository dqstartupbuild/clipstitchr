# Screen Demo Layouts

Screen Demo Layouts keep wide product demos readable after ClipStitchr
normalizes uploads to vertical 9:16 video.

## What It Does

ClipStitchr now supports three upload normalization layouts:

- `crop-fill`: the original 9:16 crop mode for UGC and mobile-shaped videos.
- `fit-with-background`: keeps the full source video visible and fills the
  vertical frame with a blurred version of the source in the background.
- `smart-screen-demo`: uses the same background layout, then zooms around
  recorded clicks and cursor pauses from CLI web recordings.

Demo uploads automatically use `fit-with-background` when the source video is
wide. UGC videos and mobile-shaped uploads keep the existing crop behavior.

## How Upload Layout Selection Works

The media worker reads the raw source dimensions before normalization. It then
chooses the upload layout in this order:

1. Use the requested `layout` from the upload job when one is present.
2. Use `fit-with-background` when the clip is a Demo and the source aspect ratio
   is at least `1.2`.
3. Use `crop-fill` for all other uploads.

Browser uploads check wide Demo files before browser-side normalization. When a
Demo file is wide, the browser queues the worker normalization path with
`layout: "fit-with-background"` instead of using the faster crop path.

CLI web recordings send `layout: "smart-screen-demo"` when interaction metadata
was captured. CLI uploads of existing files do not need to send a layout because
the worker can detect wide Demo sources itself.

## Smart Screen Demo Rendering

The CLI injects a small capture script into the recording browser before opening
the local app. It records:

- clicks;
- throttled mouse movement samples;
- event timing;
- viewport size.

The media worker turns clicks and cursor pauses into points of interest. During
normalization it renders a 9:16 output with:

- a blurred full-frame background;
- the full source screen centered as the foreground;
- smooth zooms around clicks and pauses when `layout` is
  `smart-screen-demo`.

This gives wide web-app demos a Screen Studio-style presentation without
embedding a desktop recorder dependency.

## Source References

```text
packages/clipstitchr-cli/src/recording/installBrowserInteractionCapture.ts
packages/clipstitchr-cli/src/recording/readBrowserInteractionEvents.ts
packages/clipstitchr-cli/src/commands/runDemoMakeCommand.ts
packages/clipstitchr-cli/src/upload/uploadDemoFile.ts

web/app/api/cli/uploads/demo/complete/route.ts
web/app/api/uploads/jobs/route.ts
web/lib/clipstitchr/hooks/useUploadProcessor.ts
web/lib/clipstitchr/media/readFileClipMetadata.ts
web/lib/clipstitchr/utils/getClipShouldUseUploadBackgroundLayout.ts

web/services/media-worker/selectUploadNormalizationLayout.mjs
web/services/media-worker/createScreenDemoZoomSegments.mjs
web/services/media-worker/createUploadNormalizationFilter.mjs
web/services/media-worker/runMediaWorker.mjs
```

## Notes

The implementation uses local click and cursor metadata only. It does not
include typed input, cookies, form values, page HTML, screenshots, or target app
data in the upload job metadata.

The worker keeps the old crop filter as the default. That protects UGC and
mobile-video behavior while improving wide Demo uploads.
