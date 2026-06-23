import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";
import type { QuickEditDetectorFrameSample } from "@/lib/clipstitchr/types/QuickEditDetectorFrameSample";
import { createQuickEditBlackFrameCandidate } from "@/lib/clipstitchr/server/createQuickEditBlackFrameCandidate";
import { getQuickEditFrameSampleIsBlack } from "@/lib/clipstitchr/server/getQuickEditFrameSampleIsBlack";

export function createQuickEditBlackFrameCandidates(
  samples: QuickEditDetectorFrameSample[],
) {
  const candidates: QuickEditCandidate[] = [];
  let startIndex: number | null = null;

  for (let index = 0; index < samples.length; index += 1) {
    const isBlack = getQuickEditFrameSampleIsBlack(samples[index]);

    if (isBlack && startIndex === null) {
      startIndex = index;
      continue;
    }

    if (isBlack || startIndex === null) {
      continue;
    }

    const candidate = createQuickEditBlackFrameCandidate({
      endIndex: index - 1,
      samples,
      startIndex,
    });

    if (candidate) {
      candidates.push(candidate);
    }

    startIndex = null;
  }

  if (startIndex !== null) {
    const candidate = createQuickEditBlackFrameCandidate({
      endIndex: samples.length - 1,
      samples,
      startIndex,
    });

    if (candidate) {
      candidates.push(candidate);
    }
  }

  return candidates;
}
