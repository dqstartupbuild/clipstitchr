import { normalizePublicHookText } from "@/lib/clipstitchr/tools/publicHooks/normalizePublicHookText";

export function getPublicHookTextSimilarity(
  sourceText: string,
  candidateText: string,
) {
  const source = normalizePublicHookText(sourceText).toLowerCase();
  const candidate = normalizePublicHookText(candidateText).toLowerCase();

  if (!source || !candidate) {
    return 0;
  }

  if (source === candidate) {
    return 1;
  }

  const sourceTokens = source.split(" ");
  const candidateCounts = new Map<string, number>();

  for (const token of candidate.split(" ")) {
    candidateCounts.set(token, (candidateCounts.get(token) ?? 0) + 1);
  }

  let sharedTokenCount = 0;

  for (const token of sourceTokens) {
    const remainingCount = candidateCounts.get(token) ?? 0;

    if (remainingCount > 0) {
      sharedTokenCount += 1;
      candidateCounts.set(token, remainingCount - 1);
    }
  }

  return sharedTokenCount / Math.max(1, sourceTokens.length);
}
