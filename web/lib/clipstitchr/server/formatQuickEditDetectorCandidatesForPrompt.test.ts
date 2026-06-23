import { describe, expect, it } from "vitest";
import { formatQuickEditDetectorCandidatesForPrompt } from "@/lib/clipstitchr/server/formatQuickEditDetectorCandidatesForPrompt";

describe("formatQuickEditDetectorCandidatesForPrompt", () => {
  it("formats detector evidence for model prompts", () => {
    const lines = formatQuickEditDetectorCandidatesForPrompt([
      {
        start: 1.234,
        end: 4.567,
        confidence: 0.823,
        signals: ["static-frame"],
        reason: "The video barely changes here.",
      },
    ]);

    expect(lines.join("\n")).toContain("Deterministic detector candidates");
    expect(lines.join("\n")).toContain('"start":1.23');
    expect(lines.join("\n")).toContain("manual editor");
  });
});
