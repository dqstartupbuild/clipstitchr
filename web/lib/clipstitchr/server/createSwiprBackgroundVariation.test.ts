import { describe, expect, it } from "vitest";
import { createSwiprBackgroundVariation } from "@/lib/clipstitchr/server/createSwiprBackgroundVariation";

describe("createSwiprBackgroundVariation", () => {
  it("creates a food-specific variation for pizza context", () => {
    const variation = createSwiprBackgroundVariation({
      productContext: "Pizza Palance is a neighborhood pizza restaurant.",
      random: () => 0,
    });

    expect(variation.category).toBe("food");
    expect(variation.presetId).toBe("countertop");
    expect(variation.scene).toContain("restaurant counter");
  });

  it("creates a fitness-specific variation for calisthenics context", () => {
    const variation = createSwiprBackgroundVariation({
      productContext: "Guppy Calisthenics training for outdoor athletes.",
      random: () => 0,
    });

    expect(variation.category).toBe("fitness");
    expect(variation.presetId).toBe("outdoor");
    expect(variation.scene).toContain("calisthenics park");
  });

  it("honors a preferred preset when one is supplied", () => {
    const variation = createSwiprBackgroundVariation({
      preferredPresetId: "minimal",
      productContext: "Pizza Palance is a neighborhood pizza restaurant.",
      random: () => 0,
    });

    expect(variation.category).toBe("food");
    expect(variation.presetId).toBe("minimal");
  });
});
