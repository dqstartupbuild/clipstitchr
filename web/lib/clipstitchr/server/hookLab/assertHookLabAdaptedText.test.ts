import { describe, expect, it } from "vitest";
import { assertHookLabAdaptedText } from "@/lib/clipstitchr/server/hookLab/assertHookLabAdaptedText";

describe("assertHookLabAdaptedText", () => {
  it("returns a meaningfully different adapted hook", () => {
    expect(
      assertHookLabAdaptedText({
        candidateText: "Watch how one small routine fixes a slow launch",
        sourceText: "The launch mistake nobody mentions",
      }),
    ).toBe("Watch how one small routine fixes a slow launch");
  });

  it("rejects exact and excessively overlapping adaptations", () => {
    expect(() =>
      assertHookLabAdaptedText({
        candidateText: "The launch mistake nobody mentions!",
        sourceText: "The launch mistake nobody mentions",
      }),
    ).toThrow("too close");
    expect(() =>
      assertHookLabAdaptedText({
        candidateText: "The launch mistake nobody mentions until later",
        sourceText: "The launch mistake nobody mentions",
      }),
    ).toThrow("too close");
  });
});
