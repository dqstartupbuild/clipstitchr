# Stitch Score Feature Guide

Stitch scores help users decide whether a finished Stitch is ready to post or
needs a quick edit first.

The product promise stays simple:

> Know which finished stitches are worth posting before you waste time.

## What It Does

A user can score a saved Stitch from the stitch card action menu. ClipStitchr
reviews the saved stitch and returns:

- an overall retention estimate from 0 to 100
- a hook-to-demo flow score from 0 to 100
- drop-off risk points
- suggested trims
- suggested overlay text
- a stronger opening line
- optional structured Quick Edit suggestions

The score is guidance, not a performance guarantee. It helps the user decide
what to trim, rewrite, or post first.

## Behavior

Stitch scores are stored on the stitch record as `stitchScore`.

Existing manually saved stitches will not have a score until the user chooses
**Score stitch**. Normal user-created batches also start unscored so large
batches do not automatically spend provider quota. Automated Stitchr outputs can
queue a background `stitch-score-analysis` provider job after the media worker
saves the Stitch, because the automation budget has already gated that output.
The user can score or rescore any saved stitch from the card menu.

Before scoring, the client makes sure the Stitch has a saved rendered MP4 when
the browser can create one. The full-video model receives that finished video.
If no rendered video is available to the server, Stitch Score uses the
poster/image fallback with saved stitch settings and source clip notes instead
of sending raw source videos.

If the primary full-video model fails during processing, Stitch Score retries
with the configured video fallback model. If that also fails, it retries through
the poster/image analysis path using the saved stitch poster when one exists,
plus the saved stitch settings and source clip notes.

Stitch scores are cleared when source settings, overlay text, or music changes,
because those edits can change the finished video and the score.

When a normal saved Stitch score includes `quickEditSuggestions`, the Stitch
card can show **Improve stitch**. Applying it updates only that saved Stitch's
trim, internal cut, overlay text, and Quick Edit metadata. Reset restores the
saved Stitch baseline from before the action and does not pull the latest UGC
or Demo clip defaults. Applying or resetting Quick Edit keeps the visible score
until the user chooses to rescore.

## Data Shape

Stored fields:

- `overallRetentionEstimate`: 0-100
- `hookToDemoFlow`: 0-100
- `summary`: one short reason for the score
- `dropOffRiskPoints`: up to 4 short risk notes
- `suggestedTrims`: up to 4 specific trim notes
- `suggestedOverlayText`: up to 3 short overlay ideas
- `suggestedOpeningLine`: one stronger first line
- `quickEditSuggestions`: optional non-destructive edit instructions

## Backend Flow

Manual scoring:

1. `POST /api/stitches/score` authenticates the user.
2. The route loads the owned stitch from Convex.
3. The route consumes the dedicated stitch score rate limit before provider
   work.
4. The route loads source clip records and creates a signed R2 URL for the
   rendered stitch when one exists.
5. `createStitchScoreOutputText` sends the prompt and video inputs to the
   configured full-video analysis model.
6. If there is no rendered stitch video, or if video analysis fails,
   `createStitchScoreFallbackOutputText` sends the same scoring prompt through
   the poster/image analysis model with the saved stitch poster when available.
7. `parseStitchScore` validates and clamps the provider response.
8. `stitches.updateScore` saves the score on the stitch.
9. The dashboard library refreshes and shows the score badge/details.

Automated scoring:

1. The media worker saves the automated Stitchr draft.
2. It creates a queued `stitch-score-analysis` provider job with the saved
   Stitch ID.
3. The provider worker claims that job when the `stitchr` worker tool is
   enabled.
4. The provider worker runs the same Stitch Score prompt and saves the parsed
   score through `stitches.updateScoreFromProvider`.

## Model Decision

Stitch Score uses the same full-video analysis lane as upload video analysis:

- Environment variable: `REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID`
- Default: `google/gemini-3-flash`
- Backup environment variable: `REPLICATE_UPLOAD_VIDEO_FALLBACK_MODEL_ID`
- Backup default: `lucataco/qwen2-vl-7b-instruct:bf57361c75677fc33d480d0c5f02926e621b2caa2000347cb74aeae9d2ca07ee`

This keeps finished-stitch scoring on the video-capable model path. If a
Replicate-hosted OpenAI model later supports the same video input shape, it can
be tested by overriding `REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID`.

When both full-video scoring models fail, Stitch Score falls back to the
poster/image lane:

- Environment variable: `REPLICATE_UPLOAD_ANALYSIS_MODEL_ID`
- Default: `openai/gpt-5-mini`

## Abuse Protection

The route consumes these buckets before creating a provider prediction:

- `stitchScoreAnalyze`: 60/hour/user, burst 20
- `stitchScoreAnalyzeMonthly`: 1,500/30 days/user
- `stitchScoreAnalyzeGlobal`: 1,000/hour global, burst 200

The Convex save mutation also uses the normal metadata update bucket. R2 keys
are scoped to the authenticated user before signed URLs are created.

## File Tree

Backend and data model:

- `web/convex/schema.ts`
- `web/convex/stitches.ts`
- `web/convex/validators/stitchScore.ts`
- `web/convex/rateLimiter.ts`
- `web/convex/rateLimits.ts`
- `web/convex/providerJobs.ts`
- `web/services/provider-worker/providerWorkerClaimableProviderJobs.ts`
- `web/services/provider-worker/runProviderWorker.ts`

API, prompt, parsing, and client call:

- `web/app/api/stitches/score/route.ts`
- `web/lib/clipstitchr/client/scoreStitch.ts`
- `web/lib/clipstitchr/client/saveRenderedStitchVideo.ts`
- `web/lib/clipstitchr/server/createStitchScoreFallbackOutputText.ts`
- `web/lib/clipstitchr/server/createStitchScoreOutputText.ts`
- `web/lib/clipstitchr/server/createStitchScorePosterFile.ts`
- `web/lib/clipstitchr/server/createStitchScorePrompt.ts`
- `web/lib/clipstitchr/server/createStitchScoreVideoInputs.ts`
- `web/lib/clipstitchr/server/formatStitchScoreSourceClipContext.ts`
- `web/lib/clipstitchr/server/readStitchScoreRequest.ts`
- `web/lib/clipstitchr/types/StitchScore.ts`
- `web/lib/clipstitchr/types/QuickEditSuggestions.ts`
- `web/lib/clipstitchr/utils/getStitchScoreLabel.ts`
- `web/lib/clipstitchr/utils/getStitchScoreSourceClipIds.ts`
- `web/lib/clipstitchr/utils/parseStitchScore.ts`
- `web/lib/clipstitchr/utils/parseQuickEditSuggestions.ts`

UI:

- `web/app/_components/dashboard/StitchScoreBadge.tsx`
- `web/app/_components/dashboard/StitchScoreDetails.tsx`
- `web/app/_components/dashboard/StitchCard.tsx`
- `web/app/_components/dashboard/StitchDetailsDialog.tsx`
- `web/app/_components/dashboard/StitchesSection.tsx`
- `web/app/_components/dashboard/RecentStitchesSection.tsx`
- `web/app/_components/dashboard/LoadedStitchSequencePreview.tsx`

Docs:

- `docs/features/stitch-score.md`
- `docs/features/clip-score.md`
- `docs/backend/rate-limits.md`
- `docs/architecture/models.md`
- `docs/features/quick-edit.md`
