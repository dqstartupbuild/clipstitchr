import { describe, expect, it } from "vitest";
import { normalizeStudioClipsAnalysis } from "./normalizeStudioClipsAnalysis";

describe("normalizeStudioClipsAnalysis", () => {
  it("keeps bounded transcript evidence, candidate scores, and reasoning", () => {
    expect(
      normalizeStudioClipsAnalysis({
        candidates: [
          {
            endSeconds: 20,
            id: "candidate_1",
            reasoning: ["Immediate hook", "Standalone idea"],
            score: { hook: 91, overall: 88, retention: 84 },
            startSeconds: 5,
            title: "Fast hook",
          },
        ],
        schemaVersion: "studio-clips-analysis-v1",
        summary: "One strong candidate.",
        transcriptExcerpts: [
          { endSeconds: 20, startSeconds: 5, text: "The useful moment." },
        ],
      }),
    ).toMatchObject({
      candidates: [{ score: { hook: 91, overall: 88 } }],
      transcriptExcerpts: [{ text: "The useful moment." }],
    });
  });

  it("rejects score inflation and invalid time ranges", () => {
    expect(() =>
      normalizeStudioClipsAnalysis({
        candidates: [
          {
            endSeconds: 2,
            id: "candidate_1",
            reasoning: ["Reason"],
            score: { overall: 101 },
            startSeconds: 1,
          },
        ],
        schemaVersion: "studio-clips-analysis-v1",
        transcriptExcerpts: [],
      }),
    ).toThrow("between 0 and 100");
  });
});
