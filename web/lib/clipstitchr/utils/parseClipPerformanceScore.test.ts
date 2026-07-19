import { describe, expect, it } from "vitest";
import { parseClipPerformanceScore } from "@/lib/clipstitchr/utils/parseClipPerformanceScore";

describe("parseClipPerformanceScore", () => {
  it("strips score-provided overlay text from Quick Edit suggestions", () => {
    expect(
      parseClipPerformanceScore({
        overall: 82,
        summary: "Strong opener.",
        bestUse: "Use before the demo.",
        strengths: ["Clear face"],
        fixes: ["Trim the pause"],
        quickEditSuggestions: {
          overlayText: {
            replaceWith: "Do not save this hook",
            reason: "Overlay writing is handled separately.",
          },
          removeRanges: [],
        },
      }),
    ).toEqual({
      overall: 82,
      summary: "Strong opener.",
      bestUse: "Use before the demo.",
      strengths: ["Clear face"],
      fixes: ["Trim the pause"],
    });
  });
});
