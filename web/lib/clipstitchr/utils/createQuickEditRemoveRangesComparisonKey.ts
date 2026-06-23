import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import { normalizeQuickEditRemoveRanges } from "@/lib/clipstitchr/utils/normalizeQuickEditRemoveRanges";

export function createQuickEditRemoveRangesComparisonKey(
  removeRanges: QuickEditRemoveRange[],
  duration: number,
) {
  return JSON.stringify(normalizeQuickEditRemoveRanges(removeRanges, duration));
}
