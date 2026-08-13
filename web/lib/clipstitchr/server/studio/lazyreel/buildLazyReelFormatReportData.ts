import type { LazyReelNicheReportData } from "@/lib/clipstitchr/types/lazyreel/LazyReelNicheReportData";
import { createEmptyLazyReelNicheReportData } from "./createEmptyLazyReelNicheReportData";
import { findLazyReelNicheKey } from "./findLazyReelNicheKey";
import { getLazyReelCorpusSnapshot } from "./getLazyReelCorpusSnapshot";

export function buildLazyReelFormatReportData(niche: string): LazyReelNicheReportData {
  const snapshot = getLazyReelCorpusSnapshot();
  const data = createEmptyLazyReelNicheReportData("format", niche);
  const nicheKey = findLazyReelNicheKey(
    Object.keys(snapshot.visualInsights.byNiche ?? {}),
    niche,
  );
  const nicheVisual = nicheKey ? snapshot.visualInsights.byNiche?.[nicheKey] : undefined;

  return {
    ...data,
    formatLift:
      nicheVisual?.formatsThatOverIndex?.slice(0, 8) ??
      snapshot.visualInsights.formatsThatOverIndex?.slice(0, 8) ??
      [],
    sampleSize: nicheVisual?.sampleSize ?? snapshot.visualInsights.analyzed ?? null,
    scope: nicheKey ?? "cross-niche visual sample",
    craftSignals: Object.entries(snapshot.visualInsights.craft ?? {})
      .map(([label, value]) => ({
        label: `${label}: ${value.lift?.[0]?.label ?? "unavailable"}`,
        lift: value.lift?.[0]?.lift ?? 0,
        sampleSize: value.lift?.[0]?.nTotal ?? 0,
      }))
      .filter((item) => item.lift > 1.1),
  };
}
