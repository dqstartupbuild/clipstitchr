import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ClipPerformanceScoreBadge } from "@/app/_components/dashboard/ClipPerformanceScoreBadge";
import type { ClipPerformanceScore } from "@/lib/clipstitchr/types/ClipPerformanceScore";

const score: ClipPerformanceScore = {
  bestUse: "Use it as the first UGC clip.",
  fixes: ["Trim the pause at the start."],
  overall: 84,
  strengths: ["Clear face and product moment."],
  summary: "The first second gives people a reason to stay.",
};

describe("ClipPerformanceScoreBadge", () => {
  it("renders the simple score label and number", () => {
    const markup = renderToStaticMarkup(
      <ClipPerformanceScoreBadge score={score} />,
    );

    expect(markup).toContain("Worth using");
    expect(markup).toContain("84");
  });

  it("renders nothing until a score exists", () => {
    expect(renderToStaticMarkup(<ClipPerformanceScoreBadge />)).toBe("");
  });
});
