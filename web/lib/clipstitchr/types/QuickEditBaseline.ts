import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

export type QuickEditBaseline = {
  defaultTrimRange?: VideoTrimRange;
  demoQuickEdit?: QuickEditSuggestions;
  demoTrimRange?: VideoTrimRange;
  duration?: number;
  textOverlay?: TextOverlay;
  textOverlays?: TextOverlay[];
  ugcQuickEdit?: QuickEditSuggestions;
  ugcTrimRange?: VideoTrimRange;
};
