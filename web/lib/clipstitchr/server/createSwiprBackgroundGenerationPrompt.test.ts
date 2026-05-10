import { describe, expect, it } from "vitest";
import { createSwiprBackgroundGenerationPrompt } from "@/lib/clipstitchr/server/createSwiprBackgroundGenerationPrompt";

describe("createSwiprBackgroundGenerationPrompt", () => {
  it("includes Swipr-safe background constraints", () => {
    const prompt = createSwiprBackgroundGenerationPrompt({
      productContext: "A compact espresso machine for busy founders",
      presetId: "studio",
    });

    expect(prompt).toContain("vertical 2:3 portrait background");
    expect(prompt).toContain("cropped to 9:16");
    expect(prompt).toContain("Do not include any visible words");
    expect(prompt).toContain("compact espresso machine");
  });
});
