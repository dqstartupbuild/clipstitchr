import type { LazyReelNicheReportData } from "@/lib/clipstitchr/types/lazyreel/LazyReelNicheReportData";
import { createEmptyLazyReelNicheReportData } from "./createEmptyLazyReelNicheReportData";
import { filterLazyReelExamples } from "./filterLazyReelExamples";
import { findLazyReelNicheKey } from "./findLazyReelNicheKey";
import { getLazyReelCorpusSnapshot } from "./getLazyReelCorpusSnapshot";
import { normalizeLazyReelText } from "./normalizeLazyReelText";
import { searchLazyReelAnalyzedVideos } from "./searchLazyReelAnalyzedVideos";

export function buildLazyReelOverviewReportData(niche: string): LazyReelNicheReportData {
  const snapshot = getLazyReelCorpusSnapshot();
  const data = createEmptyLazyReelNicheReportData("overview", niche);
  const insightKey = findLazyReelNicheKey(Object.keys(snapshot.insights.byNiche ?? {}), niche);
  const insight = insightKey ? snapshot.insights.byNiche?.[insightKey] : undefined;
  const wordKey = findLazyReelNicheKey(Object.keys(snapshot.wordInsights.byNiche ?? {}), niche);
  const words = wordKey ? snapshot.wordInsights.byNiche?.[wordKey] : undefined;
  const comboKey = findLazyReelNicheKey(Object.keys(snapshot.combinations.byNiche ?? {}), niche);
  const combinations = comboKey
    ? snapshot.combinations.byNiche?.[comboKey] ?? []
    : snapshot.combinations.overall ?? [];
  const normalizedTerms = normalizeLazyReelText(niche).split(" ").filter((term) => term.length > 2);
  const relatedTags = normalizedTerms.length
    ? snapshot.trendingTags.filter((item) =>
        normalizedTerms.some((term) => normalizeLazyReelText(item.tag).includes(term)),
      )
    : [];
  const latestYear = Math.max(0, ...snapshot.trendingTags.map((item) => item.year));
  const culturalTags = (relatedTags.length
    ? relatedTags
    : snapshot.trendingTags.filter((item) => item.year === latestYear)
  )
    .sort((left, right) => right.year - left.year || left.rank - right.rank)
    .slice(0, 8);
  const teardownMatches = insightKey
    ? snapshot.teardowns.filter((item) => item.niche === insightKey)
    : [];

  return {
    ...data,
    combinations: combinations.slice(0, 12).map((item) => ({
      dimensions: item.dims,
      label: item.combo,
      lift: item.lift,
      sampleSize: item.nTotal,
      winners: item.nWinners,
    })),
    corpusMatches: searchLazyReelAnalyzedVideos(snapshot.analyzedVideos, niche)
      .slice(0, 4)
      .map((item) => ({
        format: item.format,
        framework: item.framework,
        hook: item.hook,
        hookPattern: item.hookPattern,
        id: item.id,
        niche: item.niche,
        signatureDevice: item.signatureDevice,
        whyItWorked: item.whyItWorked,
      })),
    crowdedPatterns: (insight?.saturated ?? []).map((item) => ({
      label: item.label,
      lift: item.lift,
      sharePercent: item.sharePct,
    })),
    culturalTags: culturalTags.map(({ rank, tag, year }) => ({ rank, tag, year })),
    examples: filterLazyReelExamples(snapshot.examples, { niche }).slice(0, 5),
    frameworkLift: insight?.frameworks?.slice(0, 5) ?? [],
    hookLift:
      insight?.hookPatternsThatOverIndex?.slice(0, 5) ??
      snapshot.insights.overallHookLift?.slice(0, 5) ??
      [],
    openingWords: (words?.wordsThatOverIndex ?? []).slice(0, 8).map((item) => ({
      lift: item.lift,
      sampleSize: item.nTotal,
      term: item.term,
    })),
    opportunityPatterns: (insight?.gaps ?? []).map((item) => ({
      label: item.label,
      lift: item.lift,
      sharePercent: item.sharePct,
    })),
    sampleSize: insight?.sampleSize ?? null,
    scope: insightKey ?? (niche ? "cross-niche fallback" : "all niches"),
    teardowns: (teardownMatches.length ? teardownMatches : snapshot.teardowns)
      .slice(0, 3)
      .map((item) => ({
        hookPattern: item.hookPattern,
        hookTechnique: item.hookTechnique,
        reach: item.reach,
        retentionDevice: item.retentionDevice,
        stealThis: item.stealThis,
        viralMechanism: item.viralMechanism,
      })),
  };
}
