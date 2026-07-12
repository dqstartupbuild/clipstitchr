import { describe, expect, it } from "vitest";
import { normalizeHookLabSourceText } from "@/lib/clipstitchr/server/hookLab/normalizeHookLabSourceText";

describe("normalizeHookLabSourceText", () => {
  it("normalizes Unicode, casing, punctuation, symbols, and whitespace", () => {
    expect(normalizeHookLabSourceText("  THIS…   changed ｅｖｅｒｙｔｈｉｎｇ! 🚀 ")).toBe(
      "this changed everything",
    );
  });
});
