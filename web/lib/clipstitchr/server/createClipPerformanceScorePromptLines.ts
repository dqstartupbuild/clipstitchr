import { createQuickEditHybridPromptLines } from "@/lib/clipstitchr/server/createQuickEditHybridPromptLines";
import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";

export function createClipPerformanceScorePromptLines(
  mediaKind: UploadAssetAnalysisKind,
) {
  const subject =
    mediaKind === "demo-video" || mediaKind === "video"
      ? "product demo"
      : "UGC clip";

  return [
    `For performanceScore, score this ${subject} from 0 to 100 for short-form posting usefulness.`,
    "Set overall to how worth using the clip is before someone wastes time posting it.",
    "Set hook, cameraPresence, pacing, clarity, platformFit, and stitchFit when the video gives enough evidence; otherwise use your best grounded estimate from the frame or full video.",
    "Use strengths and fixes as short, plain-language notes a non-technical marketer can act on right away.",
    "When useful, include performanceScore.quickEditSuggestions with exact non-destructive edit instructions.",
    "quickEditSuggestions can include trimStart, trimEnd, candidates, removeRanges, crop, and summary.",
    "Use removeRanges for boring middle moments like loading screens, dead air, repeated frames, or pauses.",
    "Use timestamp seconds like 3.5 to 6.2. Keep ranges precise and only suggest cuts that clearly help.",
    ...createQuickEditHybridPromptLines(),
    "Do not suggest new text overlay copy.",
    "Use crop.mode smart-9x16 when black bars, poor vertical framing, low subject placement, or off-center product/demo focus should be fixed.",
    "Do not promise actual performance. Treat the score as a helpful editing and selection guess.",
  ];
}
