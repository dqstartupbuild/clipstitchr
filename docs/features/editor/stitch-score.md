# Stitch Score Feature Guide

Stitch scores help users avoid finding out a finished Stitch was weak only
after they posted it or ran it as an ad.

The product promise stays simple:

> Know which finished stitches are worth posting before you waste time.

Public copy should name the regret first: nobody wants to discover the clip was
wrong after the ad has already left the app.

## What It Does

A user can score a saved Stitch from the stitch card action menu. ClipStitchr
reviews the saved stitch and returns:

- an overall retention estimate from 0 to 100
- a hook-to-demo flow score from 0 to 100
- drop-off risk points
- suggested trims
- a posting-readiness recheck when the Stitch is rescored
- optional structured Quick Edit suggestions

The score is guidance, not a performance guarantee. It helps the user decide
what to trim, cut, crop, or use first before they spend time on the wrong fix.
Score analysis does not suggest new text overlays. Hook Lab owns hook and
overlay writing so generated copy can keep learning from user feedback.

## Behavior

The current primary score is stored on the stitch record as `stitchScore`.
The first score is also stored as `firstStitchScore` and is never replaced by
later rescoring. On the first score, both fields point at the same score. On a
rescore, `stitchScore` becomes the new primary score while `firstStitchScore`
stays as the original read. Legacy records that already had `stitchScore`
without `firstStitchScore` backfill the existing score into `firstStitchScore`
the next time they are rescored.

Existing manually saved stitches will not have a score until the user chooses
**Score stitch**. Normal user-created batches also start unscored so large
batches do not automatically spend provider quota. Automated Stitchr outputs can
queue a background `stitch-score-analysis` provider job after the media worker
saves the Stitch, because the automation budget has already gated that output.
The user can score or rescore any saved stitch from the card menu. Rescoring is
treated as a reassessment instead of a totally new critique: the prompt includes
the archived first score, the current saved trims/cuts/crop metadata, and asks
which original fixes were actually handled before judging whether the Stitch is
ready to post.

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
trim, internal cut, crop, and Quick Edit metadata. Reset restores the
saved Stitch baseline from before the action and does not pull the latest UGC
or Demo clip defaults. Applying or resetting Quick Edit keeps the visible score
until the user chooses to rescore.

Stitch Score can also return hybrid Quick Edit `candidates` for likely weak
ranges, using signals such as loading text, low motion, static frames, silence,
no words, and long pauses. Candidate-only scores are stored for review but do
not show **Improve stitch**. The action appears only when the suggestion also
contains an actual editable change such as a trim, cut range, or crop metadata.

When a saved rendered Stitch MP4 is available, Quick Edit detectors sample its
frames and audio before provider scoring and merge the resulting candidate
evidence into the saved score. See `docs/features/editor/quick-edit-detectors.md`.

## Data Shape

Stored fields:

- `firstStitchScore`: archived first score, kept forever
- `stitchScore`: current primary score
- `overallRetentionEstimate`: 0-100
- `hookToDemoFlow`: 0-100
- `summary`: one short reason for the score
- `dropOffRiskPoints`: up to 4 short risk notes
- `suggestedTrims`: up to 4 specific trim notes
- `suggestedOverlayText`: legacy field kept as an empty array for new scores
- `suggestedOpeningLine`: optional stronger opening beat note
- `quickEditSuggestions`: optional non-destructive edit instructions
- `reassessment`: optional rescore details with completed improvements,
  remaining improvements, and posting readiness

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
8. `stitches.updateScore` saves the score on the stitch, preserving the first
   score in `firstStitchScore` and replacing `stitchScore` as the primary score.
9. The dashboard library refreshes and shows the score badge/details.

Automated scoring:

1. The media worker saves the automated Stitchr draft.
2. It creates a queued `stitch-score-analysis` provider job with the saved
   Stitch ID.
3. The provider worker claims that job when the `stitchr` worker tool is
   enabled.
4. The provider worker runs the same Stitch Score prompt and saves the parsed
   score through `stitches.updateScoreFromProvider`, which uses the same first
   score preservation behavior.

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
- `web/convex/getFirstStitchScoreUpdate.ts`
- `web/convex/validators/stitchScore.ts`
- `web/convex/validators/stitchScoreReassessment.ts`
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
- `web/lib/clipstitchr/server/createQuickEditHybridPromptLines.ts`
- `web/lib/clipstitchr/server/createStitchScoreDetectorCandidates.ts`
- `web/lib/clipstitchr/server/formatQuickEditDetectorCandidatesForPrompt.ts`
- `web/lib/clipstitchr/server/createStitchScoreVideoInputs.ts`
- `web/lib/clipstitchr/server/formatStitchScoreSourceClipContext.ts`
- `web/lib/clipstitchr/server/readStitchScoreRequest.ts`
- `web/lib/clipstitchr/types/StitchScore.ts`
- `web/lib/clipstitchr/types/StitchScoreReassessment.ts`
- `web/lib/clipstitchr/types/QuickEditSuggestions.ts`
- `web/lib/clipstitchr/types/QuickEditCandidate.ts`
- `web/lib/clipstitchr/types/QuickEditCandidateSignal.ts`
- `web/lib/clipstitchr/utils/getStitchScoreLabel.ts`
- `web/lib/clipstitchr/utils/getStitchScoreSourceClipIds.ts`
- `web/lib/clipstitchr/utils/parseStitchScore.ts`
- `web/lib/clipstitchr/utils/parseStitchScoreReassessment.ts`
- `web/lib/clipstitchr/utils/parseQuickEditSuggestions.ts`
- `web/lib/clipstitchr/utils/parseQuickEditCandidate.ts`
- `web/lib/clipstitchr/utils/parseQuickEditCandidates.ts`
- `web/lib/clipstitchr/utils/getQuickEditSuggestionsHasActionableChange.ts`
- `web/lib/clipstitchr/utils/mergeQuickEditDetectorCandidatesIntoStitchScore.ts`
- `web/lib/clipstitchr/utils/removeQuickEditOverlayText.ts`

UI:

- `web/app/_components/dashboard/StitchScoreBadge.tsx`
- `web/app/_components/dashboard/StitchScoreDetails.tsx`
- `web/app/_components/dashboard/StitchCard.tsx`
- `web/app/_components/dashboard/StitchDetailsDialog.tsx`
- `web/app/_components/dashboard/StitchesSection.tsx`
- `web/app/_components/dashboard/RecentStitchesSection.tsx`
- `web/app/_components/dashboard/LoadedStitchSequencePreview.tsx`

Docs:

- `docs/features/editor/stitch-score.md`
- `docs/features/editor/clip-score.md`
- `docs/operations/security/rate-limits.md`
- `docs/architecture/data/models.md`
- `docs/features/editor/quick-edit.md`
