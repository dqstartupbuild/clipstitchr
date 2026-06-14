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

The score is guidance, not a performance guarantee. It helps the user decide
what to trim, rewrite, or post first.

## Behavior

Stitch scores are stored on the stitch record as `stitchScore`.

Existing stitches will not have a score until the user chooses **Score stitch**.
New stitches also start unscored so large batches do not automatically spend
provider quota. The user can score or rescore any saved stitch from the card
menu.

If a stitch has a rendered MP4 saved in R2, the model receives that finished
video. If the stitch only has the saved recipe, the model receives source video
URLs in stitch order when they are small enough, plus the saved trim, playback,
audio, overlay, and source clip analysis context. If no video is small enough to
send, the score falls back to saved stitch and source metadata.

Stitch scores are cleared when the stitch source settings or overlay text
change, because those edits can change the score.

## Data Shape

Stored fields:

- `overallRetentionEstimate`: 0-100
- `hookToDemoFlow`: 0-100
- `summary`: one short reason for the score
- `dropOffRiskPoints`: up to 4 short risk notes
- `suggestedTrims`: up to 4 specific trim notes
- `suggestedOverlayText`: up to 3 short overlay ideas
- `suggestedOpeningLine`: one stronger first line

## Backend Flow

1. `POST /api/stitches/score` authenticates the user.
2. The route loads the owned stitch from Convex.
3. The route consumes the dedicated stitch score rate limit before provider
   work.
4. The route loads source clip records and creates signed R2 URLs for the
   rendered stitch or eligible source videos.
5. `createStitchScoreOutputText` sends the prompt and video inputs to the
   configured full-video analysis model.
6. `parseStitchScore` validates and clamps the provider response.
7. `stitches.updateScore` saves the score on the stitch.
8. The dashboard library refreshes and shows the score badge/details.

## Model Decision

Stitch Score uses the same full-video analysis lane as upload video analysis:

- Environment variable: `REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID`
- Default: `google/gemini-3-flash`

This keeps finished-stitch scoring on the video-capable model path. If a
Replicate-hosted OpenAI model later supports the same video input shape, it can
be tested by overriding `REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID`.

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

API, prompt, parsing, and client call:

- `web/app/api/stitches/score/route.ts`
- `web/lib/clipstitchr/client/scoreStitch.ts`
- `web/lib/clipstitchr/server/createStitchScoreOutputText.ts`
- `web/lib/clipstitchr/server/createStitchScorePrompt.ts`
- `web/lib/clipstitchr/server/createStitchScoreVideoInputs.ts`
- `web/lib/clipstitchr/server/formatStitchScoreSourceClipContext.ts`
- `web/lib/clipstitchr/server/readStitchScoreRequest.ts`
- `web/lib/clipstitchr/types/StitchScore.ts`
- `web/lib/clipstitchr/utils/getStitchScoreLabel.ts`
- `web/lib/clipstitchr/utils/getStitchScoreSourceClipIds.ts`
- `web/lib/clipstitchr/utils/parseStitchScore.ts`

UI:

- `web/app/_components/dashboard/StitchScoreBadge.tsx`
- `web/app/_components/dashboard/StitchScoreDetails.tsx`
- `web/app/_components/dashboard/StitchCard.tsx`
- `web/app/_components/dashboard/StitchDetailsDialog.tsx`
- `web/app/_components/dashboard/StitchesSection.tsx`
- `web/app/_components/dashboard/RecentStitchesSection.tsx`

Docs:

- `docs/features/stitch-score.md`
- `docs/features/clip-score.md`
- `docs/backend/rate-limits.md`
- `docs/architecture/models.md`
