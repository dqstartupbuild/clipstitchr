import { describe, expect, it } from "vitest";
import { createCliprTextGenerationPrompt } from "@/lib/clipstitchr/server/createCliprTextGenerationPrompt";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const candidate: CliprHookTemplate = {
  active: true,
  allowedPurposes: ["clipr", "stitchr", "swipr"],
  bestFor: ["education"],
  emotionalTrigger: "curiosity",
  id: "MG-001",
  requiredVariables: ["topic"],
  riskLevel: "safe",
  source: "clipstitchr",
  styleKey: "mystery_gap",
  template: "The thing nobody tells you about {{topic}}",
};

const product: ProductProfile = {
  id: "product_1",
  name: "LaunchKit",
  productDetails: "Helps founders organize product launch content.",
  audienceDetails: "Founders and solo marketers.",
  createdAt: "2026-01-01T00:00:00.000Z",
  emotionalNarrative: "Founders want to stop looking scattered and feel proud.",
  inferredPainPoints: ["launch content gets scattered"],
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("createCliprTextGenerationPrompt", () => {
  it("keeps Clipr prompts non-promotional", () => {
    const prompt = createCliprTextGenerationPrompt({
      candidates: [candidate],
      durationSeconds: 30,
      fillers: { topic: ["launches"] },
      product,
      purpose: "clipr",
      slideCount: 4,
    });

    expect(prompt).toContain("For Clipr, do not directly promote the product.");
    expect(prompt).toContain("The video should still make sense");
    expect(prompt).toContain("Audience and problem are the primary source");
    expect(prompt).toContain("Product proof bank, not the script spine");
  });

  it("uses the dedicated Stitchr emotional overlay framework", () => {
    const prompt = createCliprTextGenerationPrompt({
      candidates: [candidate],
      durationSeconds: 30,
      fillers: { topic: ["launches"] },
      product,
      purpose: "stitchr",
      slideCount: 4,
    });

    expect(prompt).toContain("Create Stitchr visual overlay hook copy");
    expect(prompt).toContain("Stitchr combines a short emotional UGC reaction clip");
    expect(prompt).toContain("There is no voiceover, no spoken explanation");
    expect(prompt).toContain("Emotional Narrative Hooks");
    expect(prompt).toContain(
      "Product emotional narrative: Founders want to stop looking scattered and feel proud.",
    );
    expect(prompt).toContain("Reaction-Matched Hooks");
    expect(prompt).toContain("Most hooks should be 3-9 words");
    expect(prompt).toContain("script must be an empty string");
    expect(prompt).not.toContain("Content angles to choose from");
    expect(prompt).not.toContain("Follow-through arcs to choose from");
    expect(prompt).not.toContain("Candidate templates");
  });

  it("defines Swipr as a hook payoff carousel with a final CTA", () => {
    const prompt = createCliprTextGenerationPrompt({
      candidates: [candidate],
      durationSeconds: 30,
      fillers: { topic: ["launches"] },
      product,
      purpose: "swipr",
      slideCount: 4,
    });

    expect(prompt).toContain("slides[0] must exactly match filledHook");
    expect(prompt).toContain("final slide must plug the product");
    expect(prompt).toContain("middle slides must validate the bold claim");
    expect(prompt).toContain("middle slides must not mention the product name");
    expect(prompt).toContain("filledHook and middle slides must read like creator");
  });
});
