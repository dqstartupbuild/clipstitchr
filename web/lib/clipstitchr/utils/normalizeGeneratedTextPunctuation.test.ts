import { describe, expect, it } from "vitest";
import { normalizeGeneratedTextPunctuation } from "@/lib/clipstitchr/utils/normalizeGeneratedTextPunctuation";

describe("normalizeGeneratedTextPunctuation", () => {
  it("uses a comma before a dependent turn", () => {
    expect(normalizeGeneratedTextPunctuation("Clear copy—without filler")).toBe(
      "Clear copy, without filler",
    );
  });

  it("uses a colon before an explanation", () => {
    expect(
      normalizeGeneratedTextPunctuation("One issue remained—the missing caption"),
    ).toBe("One issue remained: the missing caption");
  });

  it("uses a period between separate thoughts", () => {
    expect(normalizeGeneratedTextPunctuation("The editor froze—we reopened it")).toBe(
      "The editor froze. We reopened it",
    );
  });

  it("uses commas around a parenthetical phrase", () => {
    expect(
      normalizeGeneratedTextPunctuation(
        "The final clip—the one from Friday—still needs captions",
      ),
    ).toBe("The final clip, the one from Friday, still needs captions");
  });
});
