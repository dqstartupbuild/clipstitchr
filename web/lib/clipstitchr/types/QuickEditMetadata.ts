import type { QuickEditBaseline } from "@/lib/clipstitchr/types/QuickEditBaseline";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";

export type QuickEditMetadata = QuickEditSuggestions & {
  appliedAt: string;
  baseline?: QuickEditBaseline;
  source: "ai-score" | "manual-crop" | "manual-cut";
};
