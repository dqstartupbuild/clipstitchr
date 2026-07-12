import { describe, expect, it } from "vitest";
import { getHookLabTextSimilarity } from "@/lib/clipstitchr/server/hookLab/getHookLabTextSimilarity";

describe("getHookLabTextSimilarity", () => {
  it("treats punctuation and casing changes as exact reuse", () => {
    expect(
      getHookLabTextSimilarity("This changed everything!", "this changed everything"),
    ).toBe(1);
  });

  it("detects source containment and separates a fresh idea", () => {
    expect(
      getHookLabTextSimilarity(
        "The launch mistake nobody mentions",
        "The launch mistake nobody mentions until it is too late",
      ),
    ).toBe(1);
    expect(
      getHookLabTextSimilarity(
        "The launch mistake nobody mentions",
        "Watch how this product turns a slow morning around",
      ),
    ).toBeLessThan(0.5);
  });
});
