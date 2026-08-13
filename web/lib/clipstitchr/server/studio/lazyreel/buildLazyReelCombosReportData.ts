import type { LazyReelNicheReportData } from "@/lib/clipstitchr/types/lazyreel/LazyReelNicheReportData";
import { createEmptyLazyReelNicheReportData } from "./createEmptyLazyReelNicheReportData";
import { findLazyReelNicheKey } from "./findLazyReelNicheKey";
import { getLazyReelCorpusSnapshot } from "./getLazyReelCorpusSnapshot";

export function buildLazyReelCombosReportData(niche: string): LazyReelNicheReportData {
  const snapshot = getLazyReelCorpusSnapshot();
  const data = createEmptyLazyReelNicheReportData("combos", niche);
  const nicheKey = findLazyReelNicheKey(
    Object.keys(snapshot.combinations.byNiche ?? {}),
    niche,
  );
  const combinations = nicheKey
    ? snapshot.combinations.byNiche?.[nicheKey] ?? []
    : snapshot.combinations.overall ?? [];

  return {
    ...data,
    combinations: combinations.map((item) => ({
      dimensions: item.dims,
      label: item.combo,
      lift: item.lift,
      sampleSize: item.nTotal,
      winners: item.nWinners,
    })),
    sampleSize: snapshot.combinations.analyzable ?? null,
    scope: nicheKey ?? "all niches",
  };
}
