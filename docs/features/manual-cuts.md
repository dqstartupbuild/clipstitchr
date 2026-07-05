# Manual Cuts Feature Guide

Manual cuts let users skip slow parts inside a Hook/UGC or Demo clip without changing
the original uploaded video. The workflow is meant for moments like loading
screens, long pauses, and dead air where AI Quick Edit may suggest the right
idea but choose the wrong exact timestamps.

## What It Does

Users can open a clip's controls and add one or more cut ranges. Each range has
a start time and end time, and preview/export skips those sections while keeping
the source file in R2 untouched.

The editor uses a compact timeline instead of paired range sliders. Users can
scrub the playhead, click the preview to the same timestamp in clip details,
drop a quick cut at the playhead, mark a start and cut to the current playhead,
drag full cut blocks, resize cut edges, select saved cuts, and type exact
timestamps in the selected-cut inspector.

When clip scoring finds likely dead space, the card can show **Review AI cuts**
instead of applying the edit immediately. That opens this same timeline editor
with AI-suggested cut blocks already placed. The user can tighten, move, remove,
or save those blocks before anything becomes active.

The same control is available in saved normal Stitches. When a saved Stitch is
edited, the user can add Hook/UGC cuts and Demo cuts on the source settings panel.
Those cuts apply only to that saved Stitch, regenerate its poster, and clear any
stale rendered MP4 so the next preview or download is rebuilt from the current
metadata.

Longr sequence Stitches do not expose the Hook/UGC and Demo source cut workflow because
their source timing is sequence-segment based.

## Source Clip Behavior

Hook/UGC and Demo source clips store manual cuts in `quickEdit.removeRanges`. Saving
cuts uses `videoClips.updateCuts`, which validates ownership, normalizes and
merges ranges against the clip duration, stores `source: "manual-cut"`, and
preserves any existing trim, crop, overlay text, summary, and baseline metadata.
If the saved score had hybrid Quick Edit candidates, the source clip save keeps
that candidate evidence with the user-corrected manual cut ranges.

Changing source clip cuts is global for future use of that clip. New Stitches
copy the current source clip Quick Edit metadata into `ugcQuickEdit` and
`demoQuickEdit` when they are created. Existing saved Stitches keep their own
copied metadata until the user edits that saved Stitch directly.

## Saved Stitch Behavior

Saved normal Stitches store manual source cuts in `ugcQuickEdit.removeRanges` or
`demoQuickEdit.removeRanges`. Saving a cut from the Stitch edit dialog:

- loads the current Hook/UGC and Demo source media
- replaces the edited source's remove ranges without appending duplicates
- recalculates Stitch duration after trim, cuts, and playback speed
- regenerates the saved Stitch poster from the edited timeline
- clears stale `stitchObject`, `mimeType`, `size`, and Stitch-level Quick Edit
  output so future render/export uses the current source metadata

The operation does not mutate the original Hook/UGC or Demo source clip.

## Preview And Export

Manual cuts reuse the existing Quick Edit `removeRanges` timeline pipeline.
Preview maps playback time to source time and jumps over removed ranges. Export
splits each source clip into playable ranges, retimes samples continuously, and
writes the final MP4 from the untouched source media.

Manual cuts are included in:

- clip details preview
- source clip download when Quick Edit metadata is active
- Stitchr-created Stitches after source clip metadata is copied
- saved Stitch edit preview
- saved Stitch poster generation
- saved Stitch render/export

## Data Shape

Manual cuts use the same range shape as AI Quick Edit suggestions:

```json
{
  "quickEdit": {
    "source": "manual-cut",
    "appliedAt": "2026-06-23T12:00:00.000Z",
    "removeRanges": [
      {
        "start": 1.6,
        "end": 4.8,
        "reason": "Cut by hand"
      }
    ],
    "candidates": [
      {
        "start": 1.4,
        "end": 5,
        "confidence": 0.82,
        "signals": ["loading-text", "static-frame"],
        "reason": "The AI flagged the loading screen.",
        "stats": "The frame barely changes."
      }
    ],
    "baseline": {
      "defaultTrimRange": {
        "start": 0,
        "end": 18.2
      }
    }
  }
}
```

Saved Stitches store the same `removeRanges` under `ugcQuickEdit` or
`demoQuickEdit`. Source clip saves mark the source as `manual-cut`; saved Stitch
source edits keep the source-specific Quick Edit object without changing the
original clip record.

## File Tree

UI:

- `web/app/_components/cuts/VideoCutEditor.tsx`
- `web/app/_components/cuts/VideoCutPlayheadControls.tsx`
- `web/app/_components/cuts/VideoCutRangeFields.tsx`
- `web/app/_components/cuts/VideoCutRangeList.tsx`
- `web/app/_components/cuts/VideoCutTimeline.tsx`
- `web/app/_components/dashboard/VideoClipDetailsDialog.tsx`
- `web/app/_components/dashboard/VideoClipMusicPreview.tsx`
- `web/app/_components/dashboard/VideoClipCard.tsx`
- `web/app/_components/dashboard/StitchEditDialog.tsx`
- `web/app/_components/dashboard/StitchSourceSettingsPanel.tsx`

State and mutations:

- `web/lib/clipstitchr/hooks/useClipLibraryState.ts`
- `web/lib/clipstitchr/types/ClipLibraryValue.ts`
- `web/convex/videoClips.ts`
- `web/convex/stitches.ts`
- `web/convex/getQuickEditWithRemoveRanges.ts`
- `web/convex/normalizeQuickEditRemoveRanges.ts`

Helpers:

- `web/lib/clipstitchr/utils/getManualCutRangeAtPlayhead.ts`
- `web/lib/clipstitchr/utils/getTimelineSecondsFromPointer.ts`
- `web/lib/clipstitchr/utils/getVideoCutRangeFromMarkedTimes.ts`
- `web/lib/clipstitchr/utils/createQuickEditRemoveRangesComparisonKey.ts`
- `web/lib/clipstitchr/utils/getQuickEditSuggestionsWithReplacedRemoveRanges.ts`
- `web/lib/clipstitchr/utils/normalizeQuickEditRemoveRanges.ts`
- `web/lib/clipstitchr/utils/getQuickEditPlaybackDuration.ts`
- `web/lib/clipstitchr/utils/getQuickEditSuggestionsHasActionableChange.ts`

Tests:

- `web/app/_components/cuts/VideoCutEditor.test.tsx`
- `web/app/_components/dashboard/VideoClipDetailsDialog.test.tsx`
- `web/app/_components/dashboard/VideoClipMusicPreview.test.tsx`
- `web/app/_components/dashboard/StitchSourceSettingsPanel.test.tsx`
- `web/lib/clipstitchr/hooks/useClipLibraryState.test.ts`
- `web/lib/clipstitchr/utils/getManualCutRangeAtPlayhead.test.ts`
- `web/lib/clipstitchr/utils/getTimelineSecondsFromPointer.test.ts`
- `web/lib/clipstitchr/utils/getVideoCutRangeFromMarkedTimes.test.ts`
- `web/lib/clipstitchr/utils/getQuickEditSuggestionsWithReplacedRemoveRanges.test.ts`

## Abuse Protection

Source clip cut saves are Convex metadata updates and consume
`convexMetadataUpdate` in `videoClips.updateCuts` before the write.

Saved Stitch source cut saves regenerate and upload a poster before updating
metadata. The poster upload uses the existing R2 upload signed URL and byte
limits. The final metadata write consumes `convexMetadataUpdate` in
`stitches.updateSourceCuts`, and stale saved render/poster cleanup uses the
existing R2 delete limits. No provider call, AI call, or music generation is
created by manual cuts.
