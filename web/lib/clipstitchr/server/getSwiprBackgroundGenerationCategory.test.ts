import { describe, expect, it } from "vitest";
import { getSwiprBackgroundGenerationCategory } from "@/lib/clipstitchr/server/getSwiprBackgroundGenerationCategory";

describe("getSwiprBackgroundGenerationCategory", () => {
  it("classifies pizza products as food", () => {
    expect(
      getSwiprBackgroundGenerationCategory(
        "Pizza Palance is a local pizzeria with delivery specials.",
      ),
    ).toBe("food");
  });

  it("classifies calisthenics products as fitness", () => {
    expect(
      getSwiprBackgroundGenerationCategory(
        "Guppy Calisthenics helps athletes train pull-up strength.",
      ),
    ).toBe("fitness");
  });
});
