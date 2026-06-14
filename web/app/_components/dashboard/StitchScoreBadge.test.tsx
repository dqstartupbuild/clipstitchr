import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StitchScoreBadge } from "@/app/_components/dashboard/StitchScoreBadge";
import type { StitchScore } from "@/lib/clipstitchr/types/StitchScore";

const score: StitchScore = {
  dropOffRiskPoints: ["Demo starts late"],
  hookToDemoFlow: 80,
  overallRetentionEstimate: 74,
  suggestedOpeningLine: "Wait for the demo",
  suggestedOverlayText: ["Wait for the demo"],
  suggestedTrims: ["Cut the pause"],
  summary: "The opener works.",
};

describe("StitchScoreBadge", () => {
  it("renders the retention label and score", () => {
    const markup = renderToStaticMarkup(<StitchScoreBadge score={score} />);

    expect(markup).toContain("Worth posting");
    expect(markup).toContain("74");
    expect(markup).toContain("bg-purple-50");
  });

  it("renders nothing without a score", () => {
    expect(renderToStaticMarkup(<StitchScoreBadge />)).toBe("");
  });
});
