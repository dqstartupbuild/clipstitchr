# Quick Edit Detector Guide

Quick Edit detectors add a timestamp-accuracy layer before the AI decides what
to recommend.

The detector does not edit video. It looks for weak ranges that are easy to
measure, then stores them as `quickEditSuggestions.candidates` so the AI and the
manual cut editor have better timing evidence.

## What It Detects

The current production detector uses the server worker stack that is already in
place:

- FFmpeg samples one small grayscale frame per second.
- Frame math finds black frames, repeated frames, static frames, and low-motion
  runs.
- FFmpeg silence detection finds dead audio, no-word sections, and long pauses.
- Detected ranges are normalized, merged, capped, and passed to the scoring
  prompt.

The detector candidates are evidence only. They do not change playback or
export on their own. When a score only has candidates, the Library and Stitchr
picker can open **Review AI cuts** with those candidates as temporary cut blocks.
They become real cuts only if the user saves them in the manual cut editor.

## OpenCV Path

The detector layer is isolated so it can be upgraded to an OpenCV backend later.
The linked [`opencv/opencv`](https://github.com/opencv/opencv) project is the
native C++ computer-vision library. Using it directly would mean adding native
bindings or an OpenCV.js runtime to the server image. The current implementation
avoids that deployment cost while keeping the same candidate schema and prompt
contract.

Good OpenCV upgrade points:

- replace frame-difference math with OpenCV `absdiff`, thresholding, and contour
  analysis
- detect loading spinners through template matching or circular motion patterns
- add OCR through a separate OCR engine for visible "loading" text
- add scene-change confidence from histogram comparison
- keep writing the same `QuickEditCandidate` objects

## Backend Flow

Upload analysis and saved clip scoring:

1. The route or provider worker consumes the existing upload video analysis rate
   limit.
2. It signs or receives the video source.
3. `createQuickEditDetectorCandidates` extracts visual/audio candidates.
4. The candidates are passed into `createUploadVideoAnalysisOutputText`.
5. The AI uses them as evidence while scoring the video.
6. Parsed `performanceScore.quickEditSuggestions` is merged with detector
   candidates before saving.

Stitch scoring:

1. The route or provider worker consumes the existing Stitch score rate limit.
2. `createStitchScoreDetectorCandidates` analyzes the saved rendered Stitch MP4
   when one exists and is inside the video-analysis size cap.
3. The candidates are passed into `createStitchScoreOutputText`.
4. Parsed `stitchScore.quickEditSuggestions` is merged with detector candidates
   before saving.

## File Tree

Detector source and execution:

- `web/lib/clipstitchr/server/createQuickEditDetectorCandidates.ts`
- `web/lib/clipstitchr/server/createQuickEditDetectorSource.ts`
- `web/lib/clipstitchr/server/runQuickEditDetectorFfmpeg.ts`
- `web/lib/clipstitchr/server/createStitchScoreDetectorCandidates.ts`

Visual/audio extraction:

- `web/lib/clipstitchr/server/extractQuickEditDetectorFrameSamples.ts`
- `web/lib/clipstitchr/server/extractQuickEditSilenceRanges.ts`
- `web/lib/clipstitchr/server/parseQuickEditSilenceRanges.ts`
- `web/lib/clipstitchr/server/getQuickEditDetectorFrameStats.ts`
- `web/lib/clipstitchr/server/getQuickEditDetectorFrameDifference.ts`

Candidate creation:

- `web/lib/clipstitchr/server/createQuickEditBlackFrameCandidate.ts`
- `web/lib/clipstitchr/server/createQuickEditBlackFrameCandidates.ts`
- `web/lib/clipstitchr/server/createQuickEditLowMotionCandidate.ts`
- `web/lib/clipstitchr/server/createQuickEditLowMotionCandidates.ts`
- `web/lib/clipstitchr/server/createQuickEditVisualCandidates.ts`
- `web/lib/clipstitchr/server/createQuickEditSilenceCandidates.ts`
- `web/lib/clipstitchr/server/createQuickEditLowMotionSignals.ts`
- `web/lib/clipstitchr/server/getQuickEditFrameSampleIsBlack.ts`
- `web/lib/clipstitchr/server/getQuickEditVisualCandidateConfidence.ts`
- `web/lib/clipstitchr/server/normalizeQuickEditDetectorCandidates.ts`

Prompting and saving:

- `web/lib/clipstitchr/server/formatQuickEditDetectorCandidatesForPrompt.ts`
- `web/lib/clipstitchr/utils/mergeQuickEditDetectorCandidatesIntoSuggestions.ts`
- `web/lib/clipstitchr/utils/mergeQuickEditDetectorCandidatesIntoUploadAssetAnalysis.ts`
- `web/lib/clipstitchr/utils/mergeQuickEditDetectorCandidatesIntoStitchScore.ts`

Types:

- `web/lib/clipstitchr/types/QuickEditDetectorFrameSample.ts`
- `web/lib/clipstitchr/types/QuickEditDetectorSource.ts`
- `web/lib/clipstitchr/types/QuickEditSilenceRange.ts`

## Abuse Protection

Detectors run only inside existing authenticated video scoring flows. They do
not add a public endpoint, new provider call, storage write, or media upload.
Upload video analysis and Stitch score limits are consumed before detector work
starts.
