import type { LazyReelNicheReportData } from "@/lib/clipstitchr/types/lazyreel/LazyReelNicheReportData";
import type { LazyReelNicheReportFocus } from "@/lib/clipstitchr/types/lazyreel/LazyReelNicheReportFocus";

export function createEmptyLazyReelNicheReportData(
  focus: LazyReelNicheReportFocus,
  niche: string,
): LazyReelNicheReportData {
  return {
    apps: [],
    categoryCounts: [],
    combinations: [],
    craftSignals: [],
    corpusMatches: [],
    crowdedPatterns: [],
    culturalTags: [],
    examples: [],
    focus,
    formatLift: [],
    frameworkLift: [],
    hookLift: [],
    niche: niche || null,
    openingWords: [],
    opportunityPatterns: [],
    sampleSize: null,
    scope: niche || "all niches",
    teardowns: [],
    topAppPatterns: [],
    trends: [],
  };
}
