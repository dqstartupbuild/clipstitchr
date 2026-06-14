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
    "Do not promise actual performance. Treat the score as a helpful editing and selection guess.",
  ];
}
