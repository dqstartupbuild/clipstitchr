import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";
import type { QuickEditDetectorFrameSample } from "@/lib/clipstitchr/types/QuickEditDetectorFrameSample";

export function createQuickEditBlackFrameCandidate({
  endIndex,
  samples,
  startIndex,
}: {
  endIndex: number;
  samples: QuickEditDetectorFrameSample[];
  startIndex: number;
}): QuickEditCandidate | null {
  const start = samples[startIndex]?.time ?? 0;
  const end = (samples[endIndex]?.time ?? start) + 1;
  const duration = end - start;

  if (duration < 1.5) {
    return null;
  }

  return {
    start,
    end,
    confidence: Math.min(0.9, 0.65 + duration * 0.05),
    signals: ["black-frame"],
    reason: "The screen is mostly black here.",
    stats: `Black-frame run for ${duration.toFixed(1)}s.`,
  };
}
