import { normalizeHookLabSourceText } from "./normalizeHookLabSourceText";

export function getHookLabTextSimilarity(sourceText: string, candidateText: string) {
  const source = normalizeHookLabSourceText(sourceText);
  const candidate = normalizeHookLabSourceText(candidateText);

  if (!source || !candidate) {
    return 0;
  }

  if (source === candidate) {
    return 1;
  }

  const sourceTokens = source.split(" ");
  const candidateTokens = candidate.split(" ");
  const candidateCounts = new Map<string, number>();

  for (const token of candidateTokens) {
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

  const tokenContainment =
    sharedTokenCount / Math.max(1, Math.min(sourceTokens.length, candidateTokens.length));
  const sourceBigrams = new Map<string, number>();
  const candidateBigrams = new Map<string, number>();

  for (let index = 0; index < Math.max(1, source.length - 1); index += 1) {
    const bigram = source.slice(index, index + 2);
    sourceBigrams.set(bigram, (sourceBigrams.get(bigram) ?? 0) + 1);
  }

  for (let index = 0; index < Math.max(1, candidate.length - 1); index += 1) {
    const bigram = candidate.slice(index, index + 2);
    candidateBigrams.set(bigram, (candidateBigrams.get(bigram) ?? 0) + 1);
  }

  let sharedBigramCount = 0;

  for (const [bigram, sourceCount] of sourceBigrams) {
    sharedBigramCount += Math.min(sourceCount, candidateBigrams.get(bigram) ?? 0);
  }

  const bigramDice =
    (2 * sharedBigramCount) /
    Math.max(
      1,
      Array.from(sourceBigrams.values()).reduce((sum, count) => sum + count, 0) +
        Array.from(candidateBigrams.values()).reduce((sum, count) => sum + count, 0),
    );

  return Math.min(1, Math.max(tokenContainment, bigramDice));
}
