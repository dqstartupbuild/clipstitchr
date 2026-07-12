import { hookLabMaximumAdaptedTextSimilarity } from "@/lib/clipstitchr/constants/hookLabMaximumAdaptedTextSimilarity";
import { getHookLabTextSimilarity } from "@/lib/clipstitchr/server/hookLab/getHookLabTextSimilarity";
import { normalizeHookLabSourceText } from "@/lib/clipstitchr/server/hookLab/normalizeHookLabSourceText";

type AssertHookLabAdaptedTextOptions = {
  candidateText: string;
  maximumSimilarity?: number;
  sourceText: string;
};

export function assertHookLabAdaptedText({
  candidateText,
  maximumSimilarity = hookLabMaximumAdaptedTextSimilarity,
  sourceText,
}: AssertHookLabAdaptedTextOptions) {
  const candidate = candidateText.trim();

  if (!candidate) {
    throw new Error("The adapted hook is empty.");
  }

  if (
    !Number.isFinite(maximumSimilarity) ||
    maximumSimilarity <= 0 ||
    maximumSimilarity > 1
  ) {
    throw new Error("The hook similarity limit is invalid.");
  }

  if (
    normalizeHookLabSourceText(candidate) === normalizeHookLabSourceText(sourceText) ||
    getHookLabTextSimilarity(sourceText, candidate) >= maximumSimilarity
  ) {
    throw new Error("The adapted hook is still too close to the source.");
  }

  return candidate;
}
