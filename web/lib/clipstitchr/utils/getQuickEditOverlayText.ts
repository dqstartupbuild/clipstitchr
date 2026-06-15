import type { ClipPerformanceScore } from "@/lib/clipstitchr/types/ClipPerformanceScore";
import type { QuickEditOverlayText } from "@/lib/clipstitchr/types/QuickEditOverlayText";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";

type GetQuickEditOverlayTextOptions = {
  performanceScore?: Pick<ClipPerformanceScore, "quickEditSuggestions"> | null;
  quickEdit?: Pick<QuickEditSuggestions, "overlayText"> | null;
};

export function getQuickEditOverlayText({
  performanceScore,
  quickEdit,
}: GetQuickEditOverlayTextOptions): QuickEditOverlayText | undefined {
  const overlayText =
    quickEdit?.overlayText ?? performanceScore?.quickEditSuggestions?.overlayText;
  const replaceWith = overlayText?.replaceWith.trim();
  const reason = overlayText?.reason?.trim();

  if (!replaceWith) {
    return undefined;
  }

  return {
    replaceWith,
    ...(reason ? { reason } : {}),
  };
}
