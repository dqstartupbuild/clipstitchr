import type { LazyReelNicheReportData } from "@/lib/clipstitchr/types/lazyreel/LazyReelNicheReportData";
import { createEmptyLazyReelNicheReportData } from "./createEmptyLazyReelNicheReportData";
import { getLazyReelCorpusSnapshot } from "./getLazyReelCorpusSnapshot";

export function buildLazyReelAppsReportData(): LazyReelNicheReportData {
  const snapshot = getLazyReelCorpusSnapshot();
  const data = createEmptyLazyReelNicheReportData("apps", "");
  const patterns = snapshot.appInsights.appAdPatterns;
  const topPatterns = [
    ...(patterns?.hookType?.breakoutLift ?? []).map((item) => ({
      label: `hook: ${item.value}`,
      lift: item.lift,
      sampleSize: item.breakout_count ?? 0,
    })),
    ...(patterns?.format?.breakoutLift ?? []).map((item) => ({
      label: `format: ${item.value}`,
      lift: item.lift,
      sampleSize: item.breakout_count ?? 0,
    })),
    ...(patterns?.productEntry?.breakoutLift ?? []).map((item) => ({
      label: `product entry: ${item.value}`,
      lift: item.lift,
      sampleSize: item.breakout_count ?? 0,
    })),
    ...(patterns?.hookXformatBreakoutLift ?? []).map((item) => ({
      label: `${item.hookType} + ${item.format}`,
      lift: item.lift,
      sampleSize: item.breakout_count ?? 0,
    })),
  ].sort((left, right) => right.lift - left.lift || left.label.localeCompare(right.label));

  return {
    ...data,
    apps: [...(snapshot.appInsights.appsTracked?.apps ?? snapshot.appInsights.appsTracked?.list ?? [])]
      .filter((item) => item.appName.toLocaleLowerCase() !== "unknown")
      .sort((left, right) => right.count - left.count || left.appName.localeCompare(right.appName))
      .slice(0, 20),
    categoryCounts: Object.entries(snapshot.appInsights.categoryCounts ?? {})
      .map(([category, count]) => ({ category, count }))
      .sort((left, right) => right.count - left.count || left.category.localeCompare(right.category)),
    sampleSize: snapshot.appInsights.analyzed ?? null,
    scope: "mobile app ads",
    topAppPatterns: topPatterns.slice(0, 12),
  };
}
