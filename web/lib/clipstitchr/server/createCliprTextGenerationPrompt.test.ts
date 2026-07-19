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
    expect(prompt).toContain("Script length: Write as much spoken script");
    expect(prompt).toContain("Never use an em dash");
    expect(prompt).not.toContain("Target duration: 30 seconds");
  });

  it("includes a user script idea as Clipr creative direction", () => {
    const prompt = createCliprTextGenerationPrompt({
      candidates: [candidate],
      durationSeconds: 30,
      fillers: { topic: ["launches"] },
      product,
      purpose: "clipr",
      scriptIdea: "Open with a founder admitting their launch content was scattered.",
      slideCount: 4,
    });

    expect(prompt).toContain("user script idea is provided");
    expect(prompt).toContain(
      "User script idea: Open with a founder admitting their launch content was scattered.",
    );
  });

  it("uses a simplified source-aware Stitchr text prompt", () => {
    const prompt = createCliprTextGenerationPrompt({
      candidates: [candidate],
      durationSeconds: 30,
      fillers: { topic: ["launches"] },
      product,
      purpose: "stitchr",
      slideCount: 4,
      stitchrClipContexts: [
        {
          id: "ugc_1",
          name: "Creator surprised by messy launch work",
          quickEditOverlayTextHint: "The moment I stopped pretending launch chaos was normal",
          quickEditOverlayTextReason: "Matches the visible frustration.",
          role: "ugc",
          tags: ["reaction"],
          videoDescription: "A founder looks frustrated at scattered files.",
        },
        {
          id: "demo_1",
          name: "LaunchKit demo",
          productDescription: "The demo shows launch assets getting organized.",
          role: "demo",
        },
      ],
    });

    expect(prompt).toContain("Write one short text overlay");
    expect(prompt).toContain("Product:");
    expect(prompt).toContain("Selected clips:");
    expect(prompt).toContain("There is no generated voiceover.");
    expect(prompt).toContain('"caption":"short feed caption"');
    expect(prompt).toContain('"hashtags":["#tagone","#tagtwo","#tagthree"]');
    expect(prompt).toContain("Write one strong result");
    expect(prompt).toContain("Most overlays should be 3-9 words");
    expect(prompt).toContain("hashtags must contain 3-5 lowercase hashtags");
    expect(prompt).toContain("Creator surprised by messy launch work");
    expect(prompt).toContain("A founder looks frustrated at scattered files.");
    expect(prompt).toContain(
      "AI hook hint: The moment I stopped pretending launch chaos was normal",
    );
    expect(prompt).toContain("AI hook hint reason: Matches the visible frustration.");
    expect(prompt).toContain("Use a real detail from the selected clips");
    expect(prompt).toContain("The demo shows launch assets getting organized.");
    expect(prompt).toContain("script must be an empty string");
    expect(prompt).toContain("Respond with only this JSON shape");
  });

  it("defines Swipr as an audience-first carousel with natural product placement", () => {
    const prompt = createCliprTextGenerationPrompt({
      candidates: [candidate],
      durationSeconds: 30,
      fillers: { topic: ["launches"] },
      product,
      purpose: "swipr",
      slideCount: 4,
      swiprCallToActionStyle: "save",
      swiprCreativeContext: "Focus on launch-day anxiety for solo founders.",
    });

    expect(prompt).toContain("You write short-form social media carousel slideshows");
    expect(prompt).toContain("Write one distinct slideshow with exactly 4 slides");
    expect(prompt).toContain("Write for the viewer first");
    expect(prompt).toContain("The product is context, not the main character");
    expect(prompt).toContain("hook, why it happens, what it costs");
    expect(prompt).toContain("the hook again as slide 1");
    expect(prompt).toContain("last follows the requested CTA style");
    expect(prompt).toContain("1000-2000 character description");
    expect(prompt).toContain("Every paragraph must add something new");
    expect(prompt).toContain("return a shorter truthful description");
    expect(prompt).toContain("Do not add an emoji by default");
    expect(prompt).toContain("zero to three specific hashtags");
    expect(prompt).not.toContain("1000-4000");
    expect(prompt).toContain("Focus on launch-day anxiety for solo founders.");
    expect(prompt).toContain(
      "Exactly one non-final slide must mention LaunchKit by name",
    );
    expect(prompt).toContain(
      "The final slide must ask the viewer to save or bookmark the post",
    );
    expect(prompt).toContain("Return only the JSON object");
  });

  it("includes Swipr creative context when provided", () => {
    const prompt = createCliprTextGenerationPrompt({
      candidates: [candidate],
      durationSeconds: 30,
      fillers: { topic: ["launches"] },
      product,
      purpose: "swipr",
      slideCount: 4,
      swiprCallToActionStyle: "product",
      swiprCreativeContext: "Use a myth-busting angle for this draft.",
    });

    expect(prompt).toContain(
      "User creative context:\nUse a myth-busting angle for this draft.",
    );
    expect(prompt).toContain("must directly promote LaunchKit");
  });
});
