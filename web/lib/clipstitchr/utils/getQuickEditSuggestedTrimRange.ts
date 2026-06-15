import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";

type GetQuickEditSuggestedTrimRangeOptions = {
  currentTrimRange: VideoTrimRange;
  duration: number;
  suggestions: QuickEditSuggestions;
};

export function getQuickEditSuggestedTrimRange({
  currentTrimRange,
  duration,
  suggestions,
}: GetQuickEditSuggestedTrimRangeOptions) {
  const clampedTrimRange = clampVideoTrimRange(currentTrimRange, duration);

  return clampVideoTrimRange(
    {
      start: suggestions.trimStart ?? clampedTrimRange.start,
      end:
        suggestions.trimEnd === undefined || suggestions.trimEnd === null
          ? clampedTrimRange.end
          : suggestions.trimEnd,
    },
    duration,
  );
}
