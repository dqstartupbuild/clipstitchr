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

  it("keeps Stitchr prompts human-first instead of product-first", () => {
    const prompt = createCliprTextGenerationPrompt({
      candidates: [candidate],
      durationSeconds: 30,
      fillers: { topic: ["launches"] },
      product,
      purpose: "stitchr",
      slideCount: 4,
    });

    expect(prompt).toContain(
      "For Stitchr, the generated text should read like a human social hook",
    );
    expect(prompt).toContain("do not mention the product name or product features");
    expect(prompt).toContain("the hook must cause a gut reaction in 2-3 seconds");
    expect(prompt).toContain("the Demo clip is the validation");
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

  it("requires b-roll Clipr prompts to stay silent and text-free", () => {
    const prompt = createCliprTextGenerationPrompt({
      candidates: [candidate],
      contentType: "b-roll-reel",
      durationSeconds: 30,
      fillers: { topic: ["launches"] },
      product,
      purpose: "clipr",
      sceneCount: 3,
      slideCount: 4,
    });

    expect(prompt).toContain("B-roll Reel must be b-roll only");
    expect(prompt).toContain("Do not write voiceover narration");
    expect(prompt).toContain("visible words, letters, numbers");
    expect(prompt).toContain("speech bubbles");
  });

  it("allows narration only for voiceover reel Clipr prompts", () => {
    const prompt = createCliprTextGenerationPrompt({
      candidates: [candidate],
      contentType: "voiceover-reel",
      durationSeconds: 30,
      fillers: { topic: ["launches"] },
      product,
      purpose: "clipr",
      sceneCount: 3,
      slideCount: 4,
    });

    expect(prompt).toContain("only non-avatar format that may use spoken");
    expect(prompt).toContain("visuals should be silent b-roll under narration");
    expect(prompt).toContain("must not show anyone speaking");
  });
});
