import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";
import type { QuickEditDetectorFrameSample } from "@/lib/clipstitchr/types/QuickEditDetectorFrameSample";
import { createQuickEditLowMotionCandidate } from "@/lib/clipstitchr/server/createQuickEditLowMotionCandidate";
import { getQuickEditDetectorFrameDifference } from "@/lib/clipstitchr/server/getQuickEditDetectorFrameDifference";
import { getQuickEditFrameSampleIsBlack } from "@/lib/clipstitchr/server/getQuickEditFrameSampleIsBlack";

export function createQuickEditLowMotionCandidates(
  samples: QuickEditDetectorFrameSample[],
) {
  const candidates: QuickEditCandidate[] = [];
  let startIndex: number | null = null;
  let differences: number[] = [];

  for (let index = 1; index < samples.length; index += 1) {
    const difference = getQuickEditDetectorFrameDifference(
      samples[index - 1].pixels,
      samples[index].pixels,
    );
    const hasLowMotion =
      difference < 7 && !getQuickEditFrameSampleIsBlack(samples[index]);

    if (hasLowMotion) {
      startIndex ??= index;
      differences.push(difference);
      continue;
    }

    if (startIndex !== null) {
      const candidate = createQuickEditLowMotionCandidate({
        differences,
        endIndex: index - 1,
        samples,
        startIndex,
      });

      if (candidate) {
        candidates.push(candidate);
      }
    }

    startIndex = null;
    differences = [];
  }

  if (startIndex !== null) {
    const candidate = createQuickEditLowMotionCandidate({
      differences,
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
