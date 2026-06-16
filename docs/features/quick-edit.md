# Quick Edit Feature Guide

Quick Edit gives users one lightweight action after AI scoring:

> Improve this clip without touching the original upload.

It uses the existing clip score and Stitch score analysis. No new AI provider,
music feature, or full video editor is introduced.

## What It Does

After a UGC clip, Demo clip, or saved normal Stitch has a score with structured
`quickEditSuggestions`, the card action menu can show **Improve clip** or
**Improve stitch**.

Applying the action can save:

- a tighter start trim
- a tighter end trim
- internal remove ranges that playback and export skip
- replacement overlay text for saved Stitches
- crop/framing metadata for future render support
- a short explanation from the AI

The source video blob in R2 is never modified. Quick Edit stores metadata on
the clip or Stitch record and all render paths read that metadata.

## Source Clip Behavior

UGC and Demo Quick Edit updates the clip's global default trim metadata. This
affects future Stitchr selections and source clip preview/export, but it does
not mutate existing saved Stitches.

If the clip score includes an overlay text suggestion, that text is stored on
the clip as a future hook hint. Stitchr auto-text sends the hint to the writing
prompt as optional direction when generating overlay hooks and captions. The
generated hook can use, ignore, or improve the hint, and the user can still edit
the result before export.

When a new Stitch is created, Stitchr copies the current source clip Quick Edit
metadata into the saved Stitch as `ugcQuickEdit` and `demoQuickEdit`. Later
changes to the source UGC or Demo clip do not rewrite that saved Stitch.

Resetting a source clip restores the default trim snapshot that existed before
Quick Edit was applied and clears the clip's `quickEdit` metadata.

## Saved Stitch Behavior

Saved normal Stitches get their own `quickEdit` metadata. Applying Quick Edit
to a scored Stitch:

- maps finished-stitch timeline cuts back into that Stitch's saved UGC/Demo
  edit metadata
- updates the saved UGC/Demo trim ranges for that Stitch only
- replaces the first saved text overlay when the AI suggests stronger overlay
  text
- clears stale saved render fields so the next preview or download uses the
  updated video
- keeps the existing Stitch Score visible until the user chooses to rescore

Resetting a saved Stitch restores the saved baseline snapshot from before
Quick Edit was applied. It does not read the latest source clip defaults, and it
does not clear the saved score.

Longr exports inherit source clip Quick Edit metadata through sequence segments,
but the one-click scored-Stitch remap is intentionally limited to normal
two-source Stitches because the current score suggestions are mapped across UGC
and Demo sections.

## Automation Behavior

Automated Stitchr uses the same source clip context as manual Stitchr. When a
UGC or Demo clip has a score overlay suggestion, the provider worker passes that
line to Stitchr auto-text as a soft hook hint. If Quick Edit has already been
applied to the source clip, the applied Quick Edit overlay text wins over the
raw score suggestion.

Automation also copies active source Quick Edit metadata into the saved Stitch
as `ugcQuickEdit` and `demoQuickEdit`. The media worker stores those edits on
the automated Stitch and calculates the Stitch duration after internal removed
ranges, so later preview, download, and export skip the same sections without
modifying the original source media.

## Preview And Export

Internal cuts are stored as `removeRanges`. Preview hooks map source time to the
edited playback time and jump over removed ranges. Export helpers split each
trimmed clip into playable ranges, retime samples continuously, and write the
final MP4 without deleting source media.

The same range metadata is used for:

- clip details preview
- Stitchr builder preview
- saved Stitch source preview
- Longr preview
- source clip download when Quick Edit is active
- saved Stitch render/export
- Stitchr-created Stitches after source clip Quick Edit defaults are copied

Poster generation uses the same edited playback ranges. When source UGC or Demo
clips have active Quick Edit metadata, Stitch poster capture maps the chosen
edited timeline moment back to the correct original source timestamp before
drawing the video frame and text. Applying or resetting Quick Edit on a saved
Stitch tries to regenerate the poster with the updated ranges; if capture fails,
the app clears the stale poster reference instead of keeping an incorrect frame.

Crop suggestions are stored as metadata with `mode: "smart-9x16"`. The current
MVP keeps the existing normalized 9:16 render path and does not add OpenCV or
MediaPipe.

## Data Shape

Score parsers accept optional `quickEditSuggestions`:

```json
{
  "trimStart": 0,
  "trimEnd": null,
  "removeRanges": [
    {
      "start": 4.2,
      "end": 7.8,
      "reason": "Loading screen slows down the before/after payoff."
    }
  ],
  "overlayText": {
    "replaceWith": "The moment I realized my landing page was the problem",
    "reason": "Makes the emotional hook clearer."
  },
  "crop": {
    "mode": "smart-9x16",
    "removeBlackBars": true,
    "reason": "Current framing has black bars."
  },
  "summary": "Cut the slow loading section and tightened the hook text."
}
```

Applied metadata uses the same suggestion fields plus:

- `appliedAt`
- `source: "ai-score"`
- `baseline` for undo/reset

## File Tree

Data model and mutations:

- `web/convex/schema.ts`
- `web/convex/videoClips.ts`
- `web/convex/stitches.ts`
- `web/convex/validators/quickEditSuggestions.ts`
- `web/convex/validators/quickEditMetadata.ts`

Types and parsers:

- `web/lib/clipstitchr/types/QuickEditSuggestions.ts`
- `web/lib/clipstitchr/types/QuickEditMetadata.ts`
- `web/lib/clipstitchr/utils/parseQuickEditSuggestions.ts`
- `web/lib/clipstitchr/utils/createQuickEditSuggestionsFromMetadata.ts`

Edit math:

- `web/lib/clipstitchr/utils/getQuickEditPlayableRanges.ts`
- `web/lib/clipstitchr/utils/getQuickEditPlaybackDuration.ts`
- `web/lib/clipstitchr/utils/getQuickEditPlaybackTimeForSourceTime.ts`
- `web/lib/clipstitchr/utils/getQuickEditSourceTimeForPlaybackTime.ts`
- `web/lib/clipstitchr/utils/getStitchTimelineQuickEditRemoveRanges.ts`
- `web/lib/clipstitchr/utils/createStitchQuickEditUpdate.ts`

Stitchr hook hints and automation:

- `web/lib/clipstitchr/utils/createStitchrTextGenerationClipContext.ts`
- `web/lib/clipstitchr/utils/getQuickEditOverlayText.ts`
- `web/lib/clipstitchr/server/formatStitchrTextGenerationClipContext.ts`
- `web/lib/clipstitchr/server/createStitchrHookGenerationPrompt.ts`
- `web/services/provider-worker/runProviderWorker.ts`
- `web/services/media-worker/runMediaWorker.mjs`
- `web/services/media-worker/readQuickEditSuggestions.mjs`
- `web/services/media-worker/getQuickEditPlaybackDuration.mjs`

Preview and render:

- `web/lib/clipstitchr/hooks/useSequenceVideoPlayer.ts`
- `web/lib/clipstitchr/hooks/useLongrSequenceVideoPlayer.ts`
- `web/lib/clipstitchr/media/copyVideoSamplesToSource.ts`
- `web/lib/clipstitchr/media/copyAudioSamplesToSource.ts`
- `web/lib/clipstitchr/media/copyTextOverlayVideoFramesToSource.ts`
- `web/lib/clipstitchr/client/renderSavedStitchBlob.ts`

UI:

- `web/app/_components/dashboard/VideoClipCard.tsx`
- `web/app/_components/dashboard/StitchCard.tsx`
- `web/app/_components/dashboard/VideoClipMusicPreview.tsx`
- `web/app/_components/stitchr/SequenceVideoPlayer.tsx`
- `web/app/_components/stitchr/StitchrSequenceVideoPlayer.tsx`

## Abuse Protection

Quick Edit apply/reset operations are Convex metadata updates and use the
existing `convexMetadataUpdate` limiter before writes. The feature does not
create a new provider call, signed URL route, or music upload surface.
Scoring still uses the existing clip and Stitch score rate limits before the AI
returns suggestions.
