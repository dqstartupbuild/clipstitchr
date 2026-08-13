import { matchesLazyReelTextFilter } from "./matchesLazyReelTextFilter";
import { normalizeLazyReelText } from "./normalizeLazyReelText";

export function findLazyReelNicheKey(keys: string[], niche: string) {
  const normalizedNiche = normalizeLazyReelText(niche);

  if (!normalizedNiche) {
    return null;
  }

  return (
    keys.find((key) => normalizeLazyReelText(key) === normalizedNiche) ??
    keys.find((key) => matchesLazyReelTextFilter(key, niche)) ??
    null
  );
}
