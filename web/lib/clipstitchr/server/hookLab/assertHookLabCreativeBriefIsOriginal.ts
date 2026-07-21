import type { HookLabCreativeBriefContent } from "@/lib/clipstitchr/types/HookLabCreativeBriefContent";
import { getPublicHookTextSimilarity } from "@/lib/clipstitchr/tools/publicHooks/getPublicHookTextSimilarity";
import { getPublicHookTokenOverlap } from "@/lib/clipstitchr/tools/publicHooks/getPublicHookTokenOverlap";
import { normalizePublicHookText } from "@/lib/clipstitchr/tools/publicHooks/normalizePublicHookText";

export function assertHookLabCreativeBriefIsOriginal({
  brief,
  sourcePhrases,
}: {
  brief: HookLabCreativeBriefContent;
  sourcePhrases: string[];
}) {
  const candidates = [
    brief.hook,
    brief.soundOffOverlay,
    brief.callToAction,
    ...brief.beatScript,
  ];
  const sources = sourcePhrases
    .map(normalizePublicHookText)
    .filter((phrase) => phrase.length >= 12);
  const copied = candidates.some((candidate) => {
    const normalizedCandidate = normalizePublicHookText(candidate);

    if (normalizedCandidate.length < 12) {
      return false;
    }

    return sources.some((source) => {
      const shorterLength = Math.min(source.length, normalizedCandidate.length);
      const containsLongPhrase =
        shorterLength >= 24 &&
        (source.includes(normalizedCandidate) || normalizedCandidate.includes(source));
      const similarity = Math.max(
        getPublicHookTextSimilarity(source, normalizedCandidate),
        getPublicHookTextSimilarity(normalizedCandidate, source),
      );

      return (
        containsLongPhrase ||
        similarity >= 0.82 ||
        getPublicHookTokenOverlap(source, normalizedCandidate) >= 0.9
      );
    });
  });

  if (copied) {
    throw new Error(
      "The draft stayed too close to the source wording. Generate a more original brief.",
    );
  }
}
