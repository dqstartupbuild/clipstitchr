import type { QuickEditDetectorFrameSample } from "@/lib/clipstitchr/types/QuickEditDetectorFrameSample";
import { createQuickEditBlackFrameCandidates } from "@/lib/clipstitchr/server/createQuickEditBlackFrameCandidates";
import { createQuickEditLowMotionCandidates } from "@/lib/clipstitchr/server/createQuickEditLowMotionCandidates";

export function createQuickEditVisualCandidates(
  samples: QuickEditDetectorFrameSample[],
) {
  return [
    ...createQuickEditBlackFrameCandidates(samples),
    ...createQuickEditLowMotionCandidates(samples),
  ];
}
