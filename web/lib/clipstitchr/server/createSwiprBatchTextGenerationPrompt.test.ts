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
      callToActionStyle: "engagement",
      count: 4,
      creativeContext: "Focus on launch-day anxiety for solo founders.",
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
    expect(prompt).toContain("1000-2000 character description");
    expect(prompt).toContain("Every paragraph must add something new");
    expect(prompt).toContain("return a shorter truthful description");
    expect(prompt).toContain("Do not add an emoji by default");
    expect(prompt).toContain("zero to three specific hashtags");
    expect(prompt).toContain("Never use an em dash");
    expect(prompt).not.toContain("1000-4000");
    expect(prompt).toContain("Return ONLY the JSON object.");
    expect(prompt).toContain("User creative context:");
    expect(prompt).toContain("Focus on launch-day anxiety for solo founders.");
    expect(prompt).toContain(
      "Exactly one non-final slide must mention Launch Kit by name",
    );
    expect(prompt).toContain(
      "The final slide must invite a natural comment, answer, like, share, or question",
    );
    expect(prompt).toContain("Do not repeat the product mention on the final slide");
  });

  it("lets Any vary CTA styles without contradicting product promotion", () => {
    const prompt = createSwiprBatchTextGenerationPrompt({
      count: 3,
      product: createProductProfile(),
      slideCount: 8,
    });

    expect(prompt).toContain("Vary the final-slide CTA styles across the batch");
    expect(prompt).toContain(
      "If you choose a direct product CTA, the final slide may mention the product again",
    );
  });
});
