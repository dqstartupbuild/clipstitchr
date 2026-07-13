import type { CompetitorHookObservation } from "@/lib/clipstitchr/tools/competitorHookResearch/CompetitorHookObservation";
import type { CompetitorHookPattern } from "@/lib/clipstitchr/tools/competitorHookResearch/CompetitorHookPattern";
import type { CompetitorHookResearchResult } from "@/lib/clipstitchr/tools/competitorHookResearch/CompetitorHookResearchResult";

export function synthesizeCompetitorHookResearch(
  observations: readonly CompetitorHookObservation[],
): CompetitorHookResearchResult {
  const used = observations
    .slice(0, 5)
    .filter(
      (observation) =>
        observation.adLabel.trim() ||
        observation.hookWords.trim() ||
        observation.openingVisual.trim(),
    );
  const counts = new Map<CompetitorHookPattern, number>();
  used.forEach((observation) =>
    counts.set(observation.pattern, (counts.get(observation.pattern) ?? 0) + 1),
  );
  const patternCounts = Array.from(counts.entries())
    .map(([pattern, count]) => ({ pattern, count }))
    .sort(
      (left, right) =>
        right.count - left.count || left.pattern.localeCompare(right.pattern),
    );

  const evidence = used.flatMap((observation) => [
    `${observation.adLabel || "Unlabeled ad"}: the recorded hook is “${observation.hookWords.trim() || "not entered"}.”`,
    `${observation.adLabel || "Unlabeled ad"}: the opening shows ${observation.openingVisual.trim() || "no entered visual observation"}; the handoff is ${observation.productHandoff.trim() || "not entered"}.`,
    `${observation.adLabel || "Unlabeled ad"}: recorded proof is ${observation.proofShown.trim() || "not entered"}.`,
  ]);
  const recurring = patternCounts.filter((entry) => entry.count >= 2);
  if (recurring.length > 0) {
    evidence.unshift(
      ...recurring.map(
        (entry) =>
          `Observed pattern: “${entry.pattern}” was manually tagged in ${entry.count} ads.`,
      ),
    );
  }

  const inferences = used.flatMap((observation) => [
    `${observation.adLabel || "Unlabeled ad"} — audience inference: ${observation.audienceInference.trim() || "not entered"}.`,
    `${observation.adLabel || "Unlabeled ad"} — intent inference: ${observation.intentInference.trim() || "not entered"}.`,
  ]);

  return {
    evidence,
    inferences,
    observationsUsed: used.length,
    patternCounts,
    researchQuestions: [
      "Which repeated pattern is actually visible across at least two observations?",
      "Which conclusion is still only an inference that needs more evidence?",
      "What original hook could test the underlying structure without copying the words?",
    ],
  };
}
