import type { QuickEditCrop } from "@/lib/clipstitchr/types/QuickEditCrop";
import type { QuickEditOverlayText } from "@/lib/clipstitchr/types/QuickEditOverlayText";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";

export type QuickEditSuggestions = {
  trimStart?: number;
  trimEnd?: number | null;
  removeRanges: QuickEditRemoveRange[];
  overlayText?: QuickEditOverlayText;
  crop?: QuickEditCrop;
  summary?: string;
};
