import { describe, expect, it } from "vitest";
import { sanitizeGeneratedLongFormText } from "@/lib/clipstitchr/utils/sanitizeGeneratedLongFormText";

describe("sanitizeGeneratedLongFormText", () => {
  it("preserves paragraphs while choosing sentence-aware punctuation", () => {
    expect(
      sanitizeGeneratedLongFormText({
        fallback: "Fallback",
        maxLength: 200,
        text: "First point—with context.\n\nSecond point.",
      }),
    ).toBe("First point. With context.\n\nSecond point.");
  });

  it("uses the fallback when the generated text contains canned AI copy", () => {
    expect(
      sanitizeGeneratedLongFormText({
        fallback: "Two launch clips still need captions.",
        maxLength: 200,
        text: "Delve into this revolutionary workflow.",
      }),
    ).toBe("Two launch clips still need captions.");
  });
});
