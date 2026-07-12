import { getHookLabTextSimilarity } from "./getHookLabTextSimilarity";
import { normalizeHookLabSourceText } from "./normalizeHookLabSourceText";
import { hookLabMaximumAdaptedTextSimilarity } from "../../constants/hookLabMaximumAdaptedTextSimilarity";

export function getHookLabOverlappingSiblingHook({
  candidateText,
  maximumSimilarity = hookLabMaximumAdaptedTextSimilarity,
  siblingHooks,
}: {
  candidateText: string;
  maximumSimilarity?: number;
  siblingHooks: string[];
}) {
  const normalizedCandidate = normalizeHookLabSourceText(candidateText);

  return siblingHooks.find((siblingHook) => {
    const normalizedSibling = normalizeHookLabSourceText(siblingHook);

    return (
      Boolean(normalizedCandidate) &&
      (normalizedCandidate === normalizedSibling ||
        getHookLabTextSimilarity(siblingHook, candidateText) >= maximumSimilarity)
    );
  });
}
