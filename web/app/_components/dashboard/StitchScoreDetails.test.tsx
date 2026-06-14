import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StitchScoreDetails } from "@/app/_components/dashboard/StitchScoreDetails";
import type { StitchScore } from "@/lib/clipstitchr/types/StitchScore";

const score: StitchScore = {
  dropOffRiskPoints: ["2-4s: demo starts late"],
  hookToDemoFlow: 82,
  overallRetentionEstimate: 76,
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
    expect(markup).toContain("Stronger opening");
  });

  it("renders nothing without a score", () => {
    expect(renderToStaticMarkup(<StitchScoreDetails />)).toBe("");
  });
});
