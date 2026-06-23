import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";
import type { QuickEditDetectorFrameSample } from "@/lib/clipstitchr/types/QuickEditDetectorFrameSample";
import { createQuickEditLowMotionSignals } from "@/lib/clipstitchr/server/createQuickEditLowMotionSignals";
import { getQuickEditVisualCandidateConfidence } from "@/lib/clipstitchr/server/getQuickEditVisualCandidateConfidence";

export function createQuickEditLowMotionCandidate({
  differences,
  endIndex,
  samples,
  startIndex,
}: {
  differences: number[];
  endIndex: number;
  samples: QuickEditDetectorFrameSample[];
  startIndex: number;
}): QuickEditCandidate | null {
  if (!differences.length) {
    return null;
  }

  const start = Math.max(0, samples[startIndex - 1]?.time ?? 0);
  const end = (samples[endIndex]?.time ?? start) + 1;
  const duration = end - start;
  const averageDifference =
    differences.reduce((total, value) => total + value, 0) /
    differences.length;

  if (duration < 2) {
    return null;
  }

  return {
    start,
    end,
    confidence: getQuickEditVisualCandidateConfidence({
      averageDifference,
      duration,
    }),
    signals: createQuickEditLowMotionSignals(averageDifference),
    reason: "The video barely changes here.",
    stats: `Average frame change ${averageDifference.toFixed(1)} over ${duration.toFixed(1)}s.`,
  };
}
