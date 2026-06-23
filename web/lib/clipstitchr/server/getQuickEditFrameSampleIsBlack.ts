import type { QuickEditDetectorFrameSample } from "@/lib/clipstitchr/types/QuickEditDetectorFrameSample";

export function getQuickEditFrameSampleIsBlack(
  sample: QuickEditDetectorFrameSample,
) {
  return sample.mean < 10 && sample.standardDeviation < 10;
}
