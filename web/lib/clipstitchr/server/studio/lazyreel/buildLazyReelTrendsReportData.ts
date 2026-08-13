import type { LazyReelNicheReportData } from "@/lib/clipstitchr/types/lazyreel/LazyReelNicheReportData";
import { createEmptyLazyReelNicheReportData } from "./createEmptyLazyReelNicheReportData";
import { getLazyReelCorpusSnapshot } from "./getLazyReelCorpusSnapshot";
import { matchesLazyReelTextFilter } from "./matchesLazyReelTextFilter";

export function buildLazyReelTrendsReportData(
  niche: string,
  limit: number,
): LazyReelNicheReportData {
  const snapshot = getLazyReelCorpusSnapshot();
  const data = createEmptyLazyReelNicheReportData("trends", niche);
  const matchingTrends = niche
    ? snapshot.trends.filter((trend) =>
        trend.transfer.some((candidate) => matchesLazyReelTextFilter(candidate, niche)),
      )
    : snapshot.trends;
  const trends = (matchingTrends.length ? matchingTrends : snapshot.trends).slice(0, limit);

  return {
    ...data,
    scope: matchingTrends.length || !niche ? niche || "all niches" : "cross-niche fallback",
    trends: trends.map((trend) => ({
      formula: trend.formula,
      framework: trend.framework,
      hookPattern: trend.hookPattern,
      medianViewsPerFollower: trend.medianVpf,
      name: trend.name,
      recurrence: trend.recurrence,
      transfer: [...trend.transfer],
      videoFormat: trend.videoFormat,
      whyItTravels: trend.whyItTravels,
    })),
  };
}
