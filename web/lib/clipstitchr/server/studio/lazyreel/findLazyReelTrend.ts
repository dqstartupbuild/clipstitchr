import type { LazyReelCorpusSnapshot } from "./LazyReelCorpusSnapshot";
import { matchesLazyReelTextFilter } from "./matchesLazyReelTextFilter";
import { normalizeLazyReelText } from "./normalizeLazyReelText";

export function findLazyReelTrend(
  trends: LazyReelCorpusSnapshot["trends"],
  input: { niche: string; trend: string },
) {
  const namedTrend = normalizeLazyReelText(input.trend)
    ? trends.find((item) => matchesLazyReelTextFilter(item.name, input.trend))
    : undefined;

  return (
    namedTrend ??
    trends.find((item) =>
      item.transfer.some((niche) => matchesLazyReelTextFilter(niche, input.niche)),
    ) ??
    trends[0]
  );
}
