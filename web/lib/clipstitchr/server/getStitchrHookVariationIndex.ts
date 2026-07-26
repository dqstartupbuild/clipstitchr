import { getSeededIndex } from "@/lib/clipstitchr/utils/getSeededIndex";

const stitchrHookVariationCount = 30;

export function getStitchrHookVariationIndex(seed: string) {
  const normalizedSeed = seed.trim();
  const batchIndexMatch = normalizedSeed.match(/:(\d+)$/);
  const batchIndex = batchIndexMatch?.[1]
    ? Number(batchIndexMatch[1])
    : Number.NaN;

  if (Number.isInteger(batchIndex) && batchIndex > 0) {
    return (batchIndex - 1) % stitchrHookVariationCount;
  }

  return getSeededIndex(normalizedSeed || "stitchr", stitchrHookVariationCount);
}
