import { describe, expect, it } from "vitest";
import { createSwiprBatchTextGenerationPrompt } from "@/lib/clipstitchr/server/createSwiprBatchTextGenerationPrompt";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

function createProductProfile(): ProductProfile {
  return {
    audienceDetails: "Busy founders",
    createdAt: "2026-01-01T00:00:00.000Z",
    emotionalNarrative: "Move fast without messy launch work.",
    id: "product_1",
    inferredPainPoints: ["launches take too long"],
    inferredProblem: "launch work feels scattered",
    name: "Launch Kit",
    productDetails: "AI launch planner",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("createSwiprBatchTextGenerationPrompt", () => {
  it("keeps the batch prompt simple and requires the requested slide count", () => {
    const prompt = createSwiprBatchTextGenerationPrompt({
      count: 4,
      product: createProductProfile(),
      slideCount: 8,
    });

    expect(prompt).toContain(
      "You write short-form social media carousel slideshows (TikTok/Instagram).",
    );
    expect(prompt).toContain(
      "What's working for this account (style memory - respect this closely):",
    );
    expect(prompt).toContain(
      "Write 4 distinct slideshows. Each slideshow must have exactly 8 slides.",
    );
    expect(prompt).toContain("...exactly 8 slides total");
    expect(prompt).toContain("1000-4000 character TikTok post description");
    expect(prompt).toContain("Each description must be 1000-4000 characters");
    expect(prompt).toContain("Return ONLY the JSON object.");
  });
});
