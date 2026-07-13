import type { CompetitorHookObservation } from "@/lib/clipstitchr/tools/competitorHookResearch/CompetitorHookObservation";

export const defaultCompetitorHookObservations: CompetitorHookObservation[] = [
  {
    adLabel: "Ad 1",
    appName: "Competing app",
    audienceInference: "Busy people using a manual workaround",
    hookWords: "Still doing this by hand?",
    id: "observation-1",
    intentInference: "Make the current workflow feel needlessly slow",
    openingVisual: "A crowded notes screen before the product appears",
    pattern: "question",
    productHandoff: "The app opens after the question and shows one action",
    proofShown: "Only the product action; no outcome evidence",
  },
  {
    adLabel: "Ad 2",
    appName: "Another app",
    audienceInference: "People comparing task tools",
    hookWords: "My three-step reset for a messy day",
    id: "observation-2",
    intentInference: "Teach a routine and make the product part of it",
    openingVisual: "Creator points to a three-item handwritten list",
    pattern: "list",
    productHandoff: "Step two becomes a short product demo",
    proofShown: "Creator experience only; no comparative evidence",
  },
];
