import type { CompetitorHookResearchResult } from "@/lib/clipstitchr/tools/competitorHookResearch/CompetitorHookResearchResult";

export function formatCompetitorHookResearchMarkdown(
  result: CompetitorHookResearchResult,
) {
  return [
    "# Competitor Hook Research",
    "",
    `Manual observations used: ${result.observationsUsed}`,
    "",
    "## Evidence — what was entered as visible or spoken",
    ...result.evidence.map((item) => `- ${item}`),
    "",
    "## Inference — interpretations to validate",
    ...result.inferences.map((item) => `- ${item}`),
    "",
    "## Pattern counts",
    ...result.patternCounts.map(
      (entry) => `- ${entry.pattern}: ${entry.count}`,
    ),
    "",
    "## Next research questions",
    ...result.researchQuestions.map((question) => `- ${question}`),
  ].join("\n");
}
