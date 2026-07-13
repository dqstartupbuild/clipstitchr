import { describe, expect, it } from "vitest";
import { calculatePersonalizedShortFormAudit } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/calculatePersonalizedShortFormAudit";
import { createPersonalizedShortFormAuditMarkdown } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/createPersonalizedShortFormAuditMarkdown";
import { defaultShortFormAuditResponses } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/defaultShortFormAuditResponses";
import type { ShortFormAuditResponses } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditResponses";
import { shortFormAuditQuestions } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/shortFormAuditQuestions";

describe("calculatePersonalizedShortFormAudit", () => {
  it("shows a transparent 100-point total across five 20-point dimensions", () => {
    const result = calculatePersonalizedShortFormAudit(
      defaultShortFormAuditResponses,
    );

    expect(result.overallScore).toBe(50);
    expect(result.dimensions).toHaveLength(5);
    expect(result.dimensions.every((dimension) => dimension.score === 10)).toBe(
      true,
    );
    expect(shortFormAuditQuestions).toHaveLength(10);
  });

  it("sorts lost-point priorities while keeping the plan in dependency order", () => {
    const responses: ShortFormAuditResponses = Object.fromEntries(
      shortFormAuditQuestions.map((question) => [question.id, 10]),
    );
    responses["testing-variable"] = 0;
    responses["testing-rule"] = 0;
    responses["assets-openings"] = 5;

    const result = calculatePersonalizedShortFormAudit(responses);

    expect(result.priorities[0]).toMatchObject({
      dimension: "testing",
      lostPoints: 20,
    });
    expect(result.assetGaps).toEqual(["Reusable UGC hooks or opening takes"]);
    expect(result.plan).toHaveLength(14);
    expect(result.plan.map((day) => day.dimension)).toEqual([
      "clarity",
      "clarity",
      "assets",
      "assets",
      "assets",
      "repeatability",
      "repeatability",
      "repeatability",
      "testing",
      "testing",
      "testing",
      "learning",
      "learning",
      "learning",
    ]);
    expect(result.plan[8]?.action).toContain("Your audit focus");
  });

  it("creates a complete downloadable audit with all fourteen days", () => {
    const result = calculatePersonalizedShortFormAudit(
      defaultShortFormAuditResponses,
    );
    const markdown = createPersonalizedShortFormAuditMarkdown(result);

    expect(markdown).toContain("Score: 50/100");
    expect(markdown).toContain("Day 1: Lock the message");
    expect(markdown).toContain("Day 14: Start the next learning loop");
    expect(markdown).toContain(
      "does not inspect accounts, media, or performance",
    );
  });
});
