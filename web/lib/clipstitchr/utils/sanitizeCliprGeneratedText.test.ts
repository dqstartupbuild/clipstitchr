import { describe, expect, it } from "vitest";
import { sanitizeCliprGeneratedText } from "@/lib/clipstitchr/utils/sanitizeCliprGeneratedText";

describe("sanitizeCliprGeneratedText", () => {
  it("uses the supplied fallback for canned AI copy", () => {
    expect(
      sanitizeCliprGeneratedText(
        "Unlock your potential with this game changer",
        "Launch clips should not take over Friday",
      ),
    ).toBe("Launch clips should not take over Friday");
  });

  it("uses sentence-aware punctuation for em dashes", () => {
    expect(
      sanitizeCliprGeneratedText(
        "The draft looked done—until the captions disappeared",
        "Fallback",
      ),
    ).toBe("The draft looked done, until the captions disappeared");
  });
});
