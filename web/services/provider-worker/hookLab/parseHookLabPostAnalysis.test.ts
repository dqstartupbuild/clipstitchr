import { describe, expect, it } from "vitest";
import { parseHookLabPostAnalysis } from "./parseHookLabPostAnalysis";

function createReport(timeline: unknown[]) {
  return JSON.stringify({
    callToAction: "Follow for the next part.",
    caption: "The original caption",
    contentSummary: "A creator names a problem, demonstrates it, then closes.",
    format: "Direct-to-camera with a product demonstration.",
    onScreenText: ["Three steps", "Try this next"],
    openingHook: "The creator starts with a clear problem.",
    performance: {
      confidence: "The video is observed; retention is inferred.",
      engagementExplanation: "Public plays and likes support moderate interest.",
      hookScore: 78,
      limitations: ["Watch time is unavailable."],
      overallScore: 75,
      pacingScore: 73,
      platformFitScore: 80,
      retentionExplanation: "The visual change may help hold attention.",
      strengths: ["The opening is immediately understandable."],
    },
    timeline,
    transferableLessons: ["Name the problem before showing the product."],
  });
}

describe("parseHookLabPostAnalysis", () => {
  it("accepts a timestamped report that covers the complete runtime", () => {
    const analysis = parseHookLabPostAnalysis(
      createReport([
        {
          startSeconds: 0,
          endSeconds: 2.5,
          visual: "The creator addresses the camera.",
          audio: "Here is the part nobody tells you.",
        },
        {
          startSeconds: 2.5,
          endSeconds: 7,
          visual: "A screen recording demonstrates the workflow.",
          onScreenText: "Three steps",
        },
        {
          startSeconds: 7,
          endSeconds: 10,
          visual: "The creator returns and closes the video.",
        },
      ]),
      10,
    );

    expect(analysis.timeline).toHaveLength(3);
    expect(analysis.timeline.at(-1)?.endSeconds).toBe(10);
    expect(analysis.caption).toBe("The original caption");
    expect(analysis.onScreenText).toEqual(["Three steps", "Try this next"]);
  });

  it("keeps the source caption when the model omits its copy field", () => {
    const report = JSON.parse(
      createReport([
        { startSeconds: 0, endSeconds: 10, visual: "The full post." },
      ]),
    ) as Record<string, unknown>;

    delete report.caption;

    expect(
      parseHookLabPostAnalysis(JSON.stringify(report), 10, "Source caption"),
    ).toEqual(expect.objectContaining({ caption: "Source caption" }));
  });

  it("treats the imported caption as authoritative", () => {
    expect(
      parseHookLabPostAnalysis(
        createReport([
          { startSeconds: 0, endSeconds: 10, visual: "The full post." },
        ]),
        10,
        "Caption copied from the post",
      ).caption,
    ).toBe("Caption copied from the post");
  });

  it("rejects a report that skips the beginning or ending", () => {
    expect(() =>
      parseHookLabPostAnalysis(
        createReport([
          {
            startSeconds: 2,
            endSeconds: 8,
            visual: "Only the middle of the video is described.",
          },
        ]),
        10,
      ),
    ).toThrow("did not cover the full video");
  });

  it("rejects large unexplained gaps in the play-by-play", () => {
    expect(() =>
      parseHookLabPostAnalysis(
        createReport([
          {
            startSeconds: 0,
            endSeconds: 2,
            visual: "The opening is described.",
          },
          {
            startSeconds: 7,
            endSeconds: 10,
            visual: "The closing is described.",
          },
        ]),
        10,
      ),
    ).toThrow("did not cover the full video");
  });
});
