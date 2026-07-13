import { describe, expect, it } from "vitest";
import { defaultCompetitorHookObservations } from "@/lib/clipstitchr/tools/competitorHookResearch/defaultCompetitorHookObservations";
import { formatCompetitorHookResearchMarkdown } from "@/lib/clipstitchr/tools/competitorHookResearch/formatCompetitorHookResearchMarkdown";
import { synthesizeCompetitorHookResearch } from "@/lib/clipstitchr/tools/competitorHookResearch/synthesizeCompetitorHookResearch";

describe("synthesizeCompetitorHookResearch", () => {
  it("keeps manual evidence separate from visitor inference", () => {
    const result = synthesizeCompetitorHookResearch(
      defaultCompetitorHookObservations,
    );
    const markdown = formatCompetitorHookResearchMarkdown(result);

    expect(result.observationsUsed).toBe(2);
    expect(markdown).toContain(
      "Evidence — what was entered as visible or spoken",
    );
    expect(markdown).toContain("Inference — interpretations to validate");
    expect(markdown).toContain("Still doing this by hand?");
    expect(markdown).toContain("audience inference");
  });

  it("caps synthesis at five observations and counts repeated tags", () => {
    const repeated = Array.from({ length: 7 }, (_, index) => ({
      ...defaultCompetitorHookObservations[0]!,
      adLabel: `Ad ${index + 1}`,
      id: `manual-${index + 1}`,
      pattern: "question" as const,
    }));
    const result = synthesizeCompetitorHookResearch(repeated);

    expect(result.observationsUsed).toBe(5);
    expect(result.patternCounts).toEqual([{ pattern: "question", count: 5 }]);
    expect(result.evidence[0]).toContain("manually tagged in 5 ads");
  });
});
