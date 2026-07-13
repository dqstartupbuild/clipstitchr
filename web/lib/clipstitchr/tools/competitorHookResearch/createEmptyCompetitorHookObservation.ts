import type { CompetitorHookObservation } from "@/lib/clipstitchr/tools/competitorHookResearch/CompetitorHookObservation";

export function createEmptyCompetitorHookObservation(
  index: number,
): CompetitorHookObservation {
  return {
    adLabel: `Ad ${index + 1}`,
    appName: "",
    audienceInference: "",
    hookWords: "",
    id: `observation-${index + 1}`,
    intentInference: "",
    openingVisual: "",
    pattern: "other",
    productHandoff: "",
    proofShown: "",
  };
}
