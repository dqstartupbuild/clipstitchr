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
  hookEdgeLevel: "bold",
  hookGenerationGoal: "comments",
  inferredPainPoints: ["launch content gets scattered"],
  rejectedHookExamples: ["Stop scrolling"],
  updatedAt: "2026-01-01T00:00:00.000Z",
  winningHookExamples: [
    "This launch got away from me",
    "I thought launch day would feel calmer",
  ],
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

  it("uses a simplified source-aware Stitchr hook framework", () => {
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

    expect(prompt).toContain("You write short-form social hooks and captions");
    expect(prompt).toContain("Account context:");
    expect(prompt).toContain("What's working for this account");
    expect(prompt).toContain("Stitchr source context:");
    expect(prompt).toContain("There is no script or voiceover.");
    expect(prompt).toContain('"templateId":"stitchr-hook-lab"');
    expect(prompt).toContain('"caption":"short caption hook related to the overlay and clips"');
    expect(prompt).toContain('"hashtags":["#tagone","#tagtwo","#tagthree"]');
    expect(prompt).toContain('"hookVariants"');
    expect(prompt).toContain(
      "Founders want to stop looking scattered and feel proud.",
    );
    expect(prompt).toContain("Hook Lab memory:");
    expect(prompt).toContain("Goal: Get more comments");
    expect(prompt).toContain("Tone: Bold");
    expect(prompt).toContain("No saved Idea patterns yet.");
    expect(prompt).not.toContain("This launch got away from me");
    expect(prompt).not.toContain("I thought launch day would feel calmer");
    expect(prompt).toContain("Stop scrolling");
    expect(prompt).toContain("Write for the viewer first");
    expect(prompt).toContain("The product is context, not the main character");
    expect(prompt).toContain(
      "Preserve their function, not source wording",
    );
    expect(prompt).toContain(
      "Never reproduce source-specific names, brands, claims, references, or unresolved slots",
    );
    expect(prompt).toContain("hookVariants must contain 6-8 distinct hooks");
    expect(prompt).toContain("Most hooks should be 3-9 words");
    expect(prompt).toContain("hashtags must contain 3-5 hashtags");
    expect(prompt).toContain("Creator surprised by messy launch work");
    expect(prompt).toContain("A founder looks frustrated at scattered files.");
    expect(prompt).toContain(
      "AI hook hint: The moment I stopped pretending launch chaos was normal",
    );
    expect(prompt).toContain("AI hook hint reason: Matches the visible frustration.");
    expect(prompt).toContain(
      "Use the source context when it gives you a real visual detail",
    );
    expect(prompt).toContain("The demo shows launch assets getting organized.");
    expect(prompt).toContain("script must be an empty string");
    expect(prompt).toContain("Return only the JSON object");
    expect(prompt).not.toContain("Emotional Narrative Hooks");
    expect(prompt).not.toContain("Reaction-Matched Hooks");
    expect(prompt).not.toContain("Use one Stitchr emotional angle");
    expect(prompt).not.toContain("Content angles to choose from");
    expect(prompt).not.toContain("Follow-through arcs to choose from");
    expect(prompt).not.toContain("Candidate templates");
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
    expect(prompt).toContain("description must be 1000-4000 characters");
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
