import { describe, expect, it } from "vitest";
import { createSwiprBackgroundGenerationPrompt } from "@/lib/clipstitchr/server/createSwiprBackgroundGenerationPrompt";

const variation = {
  cameraAngle: "low tabletop angle",
  category: "food" as const,
  composition: "large open space across the upper center",
  lighting: "warm evening restaurant light",
  palette: "tomato red, cream, charcoal, and warm wood",
  presetId: "countertop" as const,
  scene: "empty neighborhood restaurant counter with warm ambient depth",
  surface: "warm wood counter",
};

describe("createSwiprBackgroundGenerationPrompt", () => {
  it("includes Swipr-safe background constraints", () => {
    const prompt = createSwiprBackgroundGenerationPrompt({
      productContext: "A compact espresso machine for busy founders",
      presetId: "studio",
      variation,
    });

    expect(prompt).toContain("vertical 2:3 portrait background");
    expect(prompt).toContain("cropped to 9:16");
    expect(prompt).toContain("Do not include any visible words");
    expect(prompt).toContain("compact espresso machine");
    expect(prompt).toContain("Variation scene");
    expect(prompt).toContain(variation.scene);
    expect(prompt).toContain(variation.palette);
  });

  it("uses direct 9:16 framing for Pruna background models", () => {
    const prompt = createSwiprBackgroundGenerationPrompt({
      modelId: "prunaai/wan-2.2-image",
      productContext:
        "A compact espresso machine app for TikTok carousel ads with iPhone screen mockups",
      presetId: "studio",
      variation,
    });
    const lowerPrompt = prompt.toLowerCase();

    expect(prompt).toContain("vertical 9:16 portrait photography backdrop");
    expect(prompt).toContain("empty real-world scene");
    expect(prompt).toContain("plain unmarked surfaces");
    expect(prompt).toContain(variation.scene);
    expect(prompt).toContain(variation.palette);
    expect(lowerPrompt).not.toContain("tiktok");
    expect(lowerPrompt).not.toContain("carousel");
    expect(lowerPrompt).not.toContain("ads");
    expect(lowerPrompt).not.toContain(" app ");
    expect(lowerPrompt).not.toContain("iphone");
    expect(lowerPrompt).not.toContain("screen");
    expect(lowerPrompt).not.toContain("mockup");
  });
});
