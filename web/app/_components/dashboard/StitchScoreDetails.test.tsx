import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StitchScoreDetails } from "@/app/_components/dashboard/StitchScoreDetails";
import type { StitchScore } from "@/lib/clipstitchr/types/StitchScore";

const score: StitchScore = {
  dropOffRiskPoints: ["2-4s: demo starts late"],
  hookToDemoFlow: 82,
  overallRetentionEstimate: 76,
  reassessment: {
    completedImprovements: ["The slow pause was cut"],
    remainingImprovements: ["Demo could still start sooner"],
    postingReadiness: "Almost ready after one more trim.",
  },
  suggestedOpeningLine: "Wait for this part",
  suggestedOverlayText: ["Wait for this part"],
  suggestedTrims: ["Cut the quiet pause"],
  summary: "The opener is clear and the demo could land faster.",
};

describe("StitchScoreDetails", () => {
  it("renders stitch score guidance", () => {
    const markup = renderToStaticMarkup(<StitchScoreDetails score={score} />);

    expect(markup).toContain("Stitch score");
    expect(markup).toContain("Retention estimate");
    expect(markup).toContain("Hook to demo flow");
    expect(markup).toContain("Drop-off risks");
    expect(markup).toContain("Cut the quiet pause");
    expect(markup).toContain("Recheck");
    expect(markup).toContain("The slow pause was cut");
    expect(markup).toContain("Demo could still start sooner");
    expect(markup).toContain("Almost ready after one more trim.");
    expect(markup).toContain("Stronger opening");
    expect(markup).not.toContain("Overlay ideas");
    expect(markup).toContain("bg-surface-elevated");
    expect(markup).not.toContain("bg-purple-50/70");
    expect(markup).not.toContain("bg-white/80");
  });

  it("renders nothing without a score", () => {
    expect(renderToStaticMarkup(<StitchScoreDetails />)).toBe("");
  });
});
