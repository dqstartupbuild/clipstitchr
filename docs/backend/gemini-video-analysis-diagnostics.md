# Gemini Video Analysis Diagnostics

## Purpose

Gemini video analysis can fail inside Replicate before ClipStitchr receives usable output. Upload analysis, clip rescoring, and Stitch Score all use the same Gemini video lane, so these diagnostics log the exact safe input shape sent to Replicate.

## Logged Events

`gemini-video-analysis-input` is logged immediately before the Replicate prediction is created. It includes:

- `featurePath`: `upload-analysis`, `clip-score`, or `stitch-score`
- `modelId`
- `inputMode`: `signed-url` or `file`
- signed URL host only, never the full URL
- redacted R2 key area and final file name only
- object content type and size
- signed URL expiry seconds when available
- server-side HEAD status and `content-type`, `content-length`, `accept-ranges`
- tiny range request status and range response headers

`gemini-video-analysis-prediction` is logged after Replicate completes, when prediction creation fails before an id is available, or when waiting for an existing prediction throws. Wait failures fetch the latest Replicate prediction first so the log can include the provider status and redacted error. It includes:

- `featurePath`
- `modelId`
- Replicate prediction id when available
- Replicate prediction status when available
- a redacted provider error message when available

## Source Files

- `web/lib/clipstitchr/server/createUploadVideoAnalysisOutputText.ts`
- `web/lib/clipstitchr/server/createStitchScoreOutputText.ts`
- `web/lib/clipstitchr/server/createStitchScoreVideoInputs.ts`
- `web/app/api/uploads/analyze/route.ts`
- `web/app/api/video-clips/score/route.ts`
- `web/services/provider-worker/runProviderWorker.ts`

## Safety

The diagnostics never log full signed URLs, query strings, user ids, record ids, or secrets. R2 keys are reduced to the media area and final file name, such as `video-clips/.../video.mp4`.
