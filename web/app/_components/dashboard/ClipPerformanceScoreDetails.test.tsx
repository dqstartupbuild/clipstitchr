import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ClipPerformanceScoreDetails } from "@/app/_components/dashboard/ClipPerformanceScoreDetails";
import type { ClipPerformanceScore } from "@/lib/clipstitchr/types/ClipPerformanceScore";

const score: ClipPerformanceScore = {
  bestUse: "Use it before the product demo.",
  cameraPresence: 82,
  clarity: 80,
  fixes: ["Cut the first pause.", "Move the product closer."],
  hook: 88,
  overall: 86,
  pacing: 76,
  platformFit: 84,
  stitchFit: 90,
  strengths: ["The opening line is clear.", "The face stays easy to see."],
  summary: "This clip gets to the point fast.",
};

describe("ClipPerformanceScoreDetails", () => {
  it("shows the score, best use, metrics, strengths, and fixes", () => {
    const markup = renderToStaticMarkup(
      <ClipPerformanceScoreDetails score={score} />,
    );

    expect(markup).toContain("Clip score");
    expect(markup).toContain("Worth using");
    expect(markup).toContain("86");
    expect(markup).toContain("Best use: Use it before the product demo.");
    expect(markup).toContain("Hook");
    expect(markup).toContain("What works");
    expect(markup).toContain("Quick fixes");
    expect(markup).toContain("Cut the first pause.");
    expect(markup).toContain("bg-surface-elevated");
    expect(markup).not.toContain("bg-purple-50/70");
    expect(markup).not.toContain("bg-white/80");
  });

  it("renders nothing until a score exists", () => {
    expect(renderToStaticMarkup(<ClipPerformanceScoreDetails />)).toBe("");
  });
});
