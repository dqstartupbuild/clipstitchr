# Quick Edit Feature Guide

Quick Edit gives users one lightweight action after AI scoring:

> Improve this clip without touching the original upload.

It uses the existing clip score and Stitch score analysis. No new AI provider,
music feature, or full video editor is introduced.

## What It Does

After a Hook/UGC clip, Demo clip, or saved normal Stitch has a score with structured
`quickEditSuggestions`, the card action menu can show **Improve clip** or
**Improve stitch**.

Applying the action can save:

- a tighter start trim
- a tighter end trim
- internal remove ranges that playback and export skip
- crop/framing metadata for future render support
- a short explanation from the AI

The source video blob in R2 is never modified. Quick Edit stores metadata on
the clip or Stitch record and all render paths read that metadata.

Manual cuts use the same non-destructive `removeRanges` metadata, but they are
edited directly by the user instead of coming from score suggestions. See
`docs/features/editor/manual-cuts.md` for the source clip and saved Stitch workflow.

## Hybrid Candidate Model

Quick Edit scores can now carry detector-style candidate ranges before they
become actual edits. The analysis prompt asks the model to look for signals a
timestamp detector can usually verify: loading text, loading spinners, static or
repeated frames, low motion, black frames, silence, no words, long pauses, and
scene changes.

Clip and Stitch scoring now run deterministic detectors before the provider
call when a video source is available. Those detectors sample video frames and
audio to find static, repeated, black-frame, low-motion, silence, no-word, and
long-pause ranges. The detector output is passed into the AI prompt and merged
back into saved score metadata. See `docs/features/editor/quick-edit-detectors.md`.

Those ranges are stored in `quickEditSuggestions.candidates` with timestamps,
confidence, signal names, a short reason, and short stats. Candidate ranges are
evidence only. They help explain why a section may be weak, but they do not
change playback or export by themselves.

When a candidate is strong enough, the score can also include a conservative
`removeRanges` suggestion. Clip cards show **Review AI cuts** for those cases
and open the manual cut editor with the suggested ranges already placed on the
timeline. Candidate-only clip scores also show **Review AI cuts** when the cut
editor is available; those candidates are converted into temporary review blocks
that the user can drag, resize, delete, or save. They still do not change
playback or export unless the user saves them.

Candidate-only scores do not show the one-click **Improve clip** or
**Improve stitch** action because that action is reserved for edits the app can
apply directly, such as trim, saved remove ranges, or crop metadata.

When a user saves source clip cuts after reviewing AI suggestions, ClipStitchr
keeps the score candidates alongside the corrected manual range metadata. That
gives later analysis a record of the original detector-style guess and the
human-corrected timing without modifying the uploaded video.

## Source Clip Behavior

Hook/UGC and Demo Quick Edit updates the clip's global default trim metadata. This
affects future Stitchr selections and source clip preview/export, but it does
not mutate existing saved Stitches.

Score analysis no longer creates overlay text suggestions. Hook Lab owns hook
and overlay writing so generated copy can keep learning from the user's saved
winning and rejected examples.

When a new Stitch is created, Stitchr copies the current source clip Quick Edit
metadata into the saved Stitch as `ugcQuickEdit` and `demoQuickEdit`. Later
changes to the source Hook/UGC or Demo clip do not rewrite that saved Stitch.
The Stitchr picker shows the same effective playback duration from the selected
trim range and saved source cuts, so selecting a clip starts from the saved edit
instead of appearing to use the full source length.

Resetting a source clip restores the default trim snapshot that existed before
Quick Edit was applied and clears the clip's `quickEdit` metadata.

Manual source clip cuts are saved through the same `quickEdit.removeRanges`
field with `source: "manual-cut"`. The Library and Stitchr picker both use this
source-level save path for Hook/UGC and Demo clips, so reviewing AI cuts in
Stitchr updates the clip's future default cuts. They can coexist with other
Quick Edit metadata such as crop, overlay text, summary, and baseline data.

## Saved Stitch Behavior

Saved normal Stitches get their own `quickEdit` metadata. Applying Quick Edit
to a scored Stitch:

- maps finished-stitch timeline cuts back into that Stitch's saved Hook/UGC and Demo
  edit metadata
- updates the saved Hook/UGC and Demo trim ranges for that Stitch only
- clears stale saved render fields so the next preview or download uses the
  updated video
- keeps the existing Stitch Score visible until the user chooses to rescore

Resetting a saved Stitch restores the saved baseline snapshot from before
Quick Edit was applied. It does not read the latest source clip defaults, and it
does not clear the saved score.

Manual saved Stitch cuts are stored on `ugcQuickEdit.removeRanges` or
`demoQuickEdit.removeRanges`, apply only to that saved Stitch, and clear stale
render fields so the next preview or download uses the current source timing.

Longr exports inherit source clip Quick Edit metadata through sequence segments,
but the one-click scored-Stitch remap is intentionally limited to normal
two-source Stitches because the current score suggestions are mapped across
Hook/UGC and Demo sections.

## Automation Behavior

Automated Stitchr uses the same source clip context as manual Stitchr. Raw score
overlay suggestions are ignored. If a source clip already has applied Quick Edit
overlay metadata from older records, that applied metadata can still be passed as
a soft hook hint, but new score analysis does not create those hints.

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

Poster generation uses the same edited playback ranges. When source Hook/UGC or Demo
clips have active Quick Edit metadata, Stitch poster capture maps the chosen
edited timeline moment back to the correct original source timestamp before
drawing the video frame and text. Applying or resetting Quick Edit on a saved
Stitch tries to regenerate the poster with the updated ranges; if capture fails,
the app clears the stale poster reference instead of keeping an incorrect frame.

Crop suggestions are stored as metadata with `mode: "smart-9x16"`. The current
MVP keeps the existing normalized 9:16 render path. Quick Edit detectors improve
timestamp evidence for cuts; they do not change crop rendering.

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
  "candidates": [
    {
      "start": 4.2,
      "end": 7.8,
      "confidence": 0.86,
      "signals": ["loading-text", "low-motion"],
      "reason": "Loading screen slows down the before/after payoff.",
      "stats": "Screen stays mostly unchanged."
    }
  ],
  "crop": {
    "mode": "smart-9x16",
    "removeBlackBars": true,
    "reason": "Current framing has black bars."
  },
  "summary": "Cut the slow loading section and improve vertical framing."
}
```

Applied metadata uses the same suggestion fields plus:

- `appliedAt`
- `source: "ai-score"` or `source: "manual-cut"`
- `baseline` for undo/reset

`overlayText` remains supported for historical or already-applied Quick Edit
metadata, but score parsers strip provider-returned overlay text from new clip
and Stitch scores.

## File Tree

Data model and mutations:

- `web/convex/schema.ts`
- `web/convex/videoClips.ts`
- `web/convex/stitches.ts`
- `web/convex/validators/quickEditSuggestions.ts`
- `web/convex/validators/quickEditMetadata.ts`
- `web/convex/validators/quickEditCandidate.ts`
- `web/convex/validators/quickEditCandidateSignal.ts`

Types and parsers:

- `web/lib/clipstitchr/types/QuickEditSuggestions.ts`
- `web/lib/clipstitchr/types/QuickEditCandidate.ts`
- `web/lib/clipstitchr/types/QuickEditCandidateSignal.ts`
- `web/lib/clipstitchr/types/QuickEditMetadata.ts`
- `web/lib/clipstitchr/utils/parseQuickEditSuggestions.ts`
- `web/lib/clipstitchr/utils/parseQuickEditCandidate.ts`
- `web/lib/clipstitchr/utils/parseQuickEditCandidates.ts`
- `web/lib/clipstitchr/utils/parseQuickEditCandidateSignal.ts`
- `web/lib/clipstitchr/utils/parseQuickEditCandidateSignals.ts`
- `web/lib/clipstitchr/utils/quickEditCandidateSignalValues.ts`
- `web/lib/clipstitchr/utils/getQuickEditSuggestionsHasActionableChange.ts`
- `web/lib/clipstitchr/utils/getQuickEditReviewRemoveRanges.ts`
- `web/lib/clipstitchr/utils/createQuickEditSuggestionsFromMetadata.ts`

Prompts:

- `web/lib/clipstitchr/server/createQuickEditHybridPromptLines.ts`
- `web/lib/clipstitchr/server/createClipPerformanceScorePromptLines.ts`
- `web/lib/clipstitchr/server/createStitchScorePrompt.ts`
- `web/lib/clipstitchr/server/formatQuickEditDetectorCandidatesForPrompt.ts`

Detectors:

- `web/lib/clipstitchr/server/createQuickEditDetectorCandidates.ts`
- `web/lib/clipstitchr/server/createQuickEditDetectorSource.ts`
- `web/lib/clipstitchr/server/createStitchScoreDetectorCandidates.ts`
- `web/lib/clipstitchr/server/createQuickEditBlackFrameCandidates.ts`
- `web/lib/clipstitchr/server/createQuickEditLowMotionCandidates.ts`
- `web/lib/clipstitchr/server/createQuickEditVisualCandidates.ts`
- `web/lib/clipstitchr/server/createQuickEditSilenceCandidates.ts`
- `web/lib/clipstitchr/server/extractQuickEditDetectorFrameSamples.ts`
- `web/lib/clipstitchr/server/extractQuickEditSilenceRanges.ts`
- `web/lib/clipstitchr/utils/mergeQuickEditDetectorCandidatesIntoSuggestions.ts`

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

- `web/app/_components/cuts/VideoCutEditor.tsx`
- `web/app/_components/cuts/VideoCutPlayheadControls.tsx`
- `web/app/_components/cuts/VideoCutRangeFields.tsx`
- `web/app/_components/cuts/VideoCutRangeList.tsx`
- `web/app/_components/cuts/VideoCutTimeline.tsx`
- `web/app/_components/dashboard/VideoClipCard.tsx`
- `web/app/_components/dashboard/StitchCard.tsx`
- `web/app/_components/dashboard/VideoClipMusicPreview.tsx`
- `web/app/_components/stitchr/SelectableClipCard.tsx`
- `web/app/_components/stitchr/UgcClipSelector.tsx`
- `web/app/_components/stitchr/DemoClipSelector.tsx`
- `web/app/_components/stitchr/ClipPickerPanel.tsx`
- `web/app/_components/stitchr/SequenceVideoPlayer.tsx`
- `web/app/_components/stitchr/StitchrSequenceVideoPlayer.tsx`

## Abuse Protection

Quick Edit apply/reset operations are Convex metadata updates and use the
existing `convexMetadataUpdate` limiter before writes. Manual source clip cuts
use the same Convex metadata limiter. Manual saved Stitch cuts also use the
existing R2 upload signed URL and byte limits when a replacement poster is
uploaded, then consume `convexMetadataUpdate` before the saved Stitch metadata
write. The feature does not create a new provider call or music upload surface.
Scoring still uses the existing clip and Stitch score rate limits before the AI
returns suggestions.
