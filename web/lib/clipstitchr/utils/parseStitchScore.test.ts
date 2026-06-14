import { describe, expect, it } from "vitest";
import { parseStitchScore } from "@/lib/clipstitchr/utils/parseStitchScore";

describe("parseStitchScore", () => {
  it("parses wrapped stitch scores and clamps numeric values", () => {
    expect(
      parseStitchScore(
        JSON.stringify({
          stitchScore: {
            dropOffRiskPoints: [" 0-2s pause "],
            hookToDemoFlow: 101,
            overallRetentionEstimate: 72.4,
            suggestedOpeningLine: " Wait for it ",
            suggestedOverlayText: [" This changed fast "],
            suggestedTrims: [" Cut the first pause "],
            summary: " Good handoff ",
          },
        }),
      ),
    ).toEqual({
      dropOffRiskPoints: ["0-2s pause"],
      hookToDemoFlow: 100,
      overallRetentionEstimate: 72,
      suggestedOpeningLine: "Wait for it",
      suggestedOverlayText: ["This changed fast"],
      suggestedTrims: ["Cut the first pause"],
      summary: "Good handoff",
    });
  });

  it("uses the retention score as the flow fallback", () => {
    const score = parseStitchScore({
      dropOffRiskPoints: [],
      overallRetentionEstimate: 63,
      suggestedOpeningLine: "",
      suggestedOverlayText: [],
      suggestedTrims: [],
      summary: "",
    });

    expect(score?.hookToDemoFlow).toBe(63);
  });

  it("returns undefined when no score is present", () => {
    expect(parseStitchScore("no json")).toBeUndefined();
    expect(parseStitchScore({ summary: "missing score" })).toBeUndefined();
  });
});
