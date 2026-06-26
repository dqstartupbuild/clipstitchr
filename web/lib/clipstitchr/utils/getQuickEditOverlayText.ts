import type { QuickEditOverlayText } from "@/lib/clipstitchr/types/QuickEditOverlayText";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";

type GetQuickEditOverlayTextOptions = {
  quickEdit?: Pick<QuickEditSuggestions, "overlayText"> | null;
};

export function getQuickEditOverlayText({
  quickEdit,
}: GetQuickEditOverlayTextOptions): QuickEditOverlayText | undefined {
  const overlayText = quickEdit?.overlayText;
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
