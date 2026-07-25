import { describe, expect, it } from "vitest";
import { parseCliprTextGenerationOutput } from "@/lib/clipstitchr/server/parseCliprTextGenerationOutput";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const candidates: CliprHookTemplate[] = [
  {
    active: true,
    allowedPurposes: ["clipr", "stitchr", "swipr"],
    bestFor: [],
    emotionalTrigger: "curiosity",
    id: "MG-001",
    requiredVariables: ["topic"],
    riskLevel: "safe",
    source: "clipstitchr",
    styleKey: "mystery_gap",
    template: "The thing nobody tells you about {{topic}}",
  },
  {
    active: true,
    allowedPurposes: ["stitchr"],
    bestFor: ["reaction content"],
    emotionalTrigger: "recognition",
    id: "DD-001",
    requiredVariables: ["problem"],
    riskLevel: "medium",
    source: "clipstitchr",
    styleKey: "direct_diagnosis",
    template: "This is why {{problem}} keeps happening",
  },
  {
    active: true,
    allowedPurposes: ["stitchr"],
    bestFor: ["comparison content"],
    emotionalTrigger: "surprise",
    id: "PB-001",
    requiredVariables: ["thing"],
    riskLevel: "medium",
    source: "clipstitchr",
    styleKey: "pattern_break",
    template: "I did not expect {{thing}} to look like this",
  },
];
const product: ProductProfile = {
  id: "product_1",
  name: "LaunchKit",
  productDetails: "Helps founders organize product launch content.",
  audienceDetails: "Founders and solo marketers.",
  createdAt: "2026-01-01T00:00:00.000Z",
  inferredPainPoints: ["launch content gets scattered"],
  updatedAt: "2026-01-01T00:00:00.000Z",
};
const longDescription = Array.from(
  { length: 24 },
  (_, index) =>
    `Long description sentence ${index + 1} explains why the carousel matters for a founder trying to keep launch work simple and repeatable.`,
).join(" ");

describe("parseCliprTextGenerationOutput", () => {
  it("keeps the full avatar script instead of truncating it like hook copy", () => {
    const script = [
      "The thing nobody tells you about training is that progress is easier to keep when the next step is obvious.",
      "Pick one movement, repeat it on a schedule, and make the smallest useful increase when it feels controlled.",
      "That gives you enough structure to improve without turning every session into a complicated program.",
    ].join(" ");
    const generation = parseCliprTextGenerationOutput({
      candidates,
      durationSeconds: 30,
      outputText: JSON.stringify({
        templateId: "MG-001",
        filledHook: "The thing nobody tells you about training",
        script,
        scenePlan: [
          {
            sceneType: "avatar",
            scriptText: "Short summary that should not replace the script.",
            visualPrompt: "Creator speaking to camera.",
            estimatedDurationSeconds: 8,
          },
        ],
      }),
      providerModel: "openai/gpt-4.1",
      product,
      purpose: "clipr",
      slideCount: 4,
    });

    expect(generation.script).toBe(script);
    expect(generation.scenePlan).toMatchObject([
      {
        sceneType: "avatar",
        scriptText: script,
        estimatedDurationSeconds: 8,
      },
    ]);
  });

  it("replaces unresolved placeholder hooks before returning text", () => {
    const generation = parseCliprTextGenerationOutput({
      candidates,
      durationSeconds: 30,
      outputText: JSON.stringify({
        templateId: "MG-001",
        filledHook: "The thing nobody tells you about topic",
        slides: ["The thing nobody tells you about topic"],
      }),
      providerModel: "openai/gpt-4.1",
      product,
      purpose: "clipr",
      slideCount: 3,
    });

    expect(generation.filledHook).toBe(
      "The overlooked detail: launch content gets scattered",
    );
    expect(generation.slides[0]).toBe(generation.filledHook);
  });

  it("preserves Swipr model slides while anchoring the first slide to the hook", () => {
    const generation = parseCliprTextGenerationOutput({
      candidates,
      durationSeconds: 30,
      outputText: JSON.stringify({
        templateId: "MG-001",
        caption: "This is where launch work gets easier",
        description: longDescription,
        filledHook: "The launch mistake nobody talks about",
        hashtags: ["launch", "founders", "content"],
        slides: [
          "The launch mistake nobody talks about",
          "Your files are spread across too many places",
          "LaunchKit keeps the next step clearer",
          "Follow for more launch fixes",
        ],
      }),
      providerModel: "openai/gpt-4.1",
      product,
      purpose: "swipr",
      slideCount: 4,
    });

    expect(generation.slides).toHaveLength(4);
    expect(generation.slides[0]).toBe(generation.filledHook);
    expect(generation.slides.slice(1, -1).join(" ")).toContain(
      "LaunchKit",
    );
    expect(generation.slides.at(-1)).toBe("Follow for more launch fixes");
    expect(generation.description).toBe(longDescription);
    expect(generation.socialCaption).toContain(longDescription);
    expect(generation.socialCaption).toContain("#launch #founders #content");
  });

  it("keeps Stitchr fallback text emotional and scriptless", () => {
    const generation = parseCliprTextGenerationOutput({
      candidates,
      durationSeconds: 30,
      outputText: JSON.stringify({
        templateId: "missing-template",
        caption: "That reaction tells you everything",
        filledHook: "product_details: {{topic}}",
        hashtags: ["Launch Kit", "#Creator Tips", "ugc"],
        overlayText: "",
        scenePlan: [
          {
            scriptText: "Sign up now and buy this today.",
            visualPrompt: "",
            estimatedDurationSeconds: 2,
          },
        ],
        slides: "not an array",
        variablesUsed: {
          empty: "   ",
          ignored: 42,
          topic: " launch ops ",
        },
      }),
      providerModel: "openai/gpt-4.1",
      product,
      purpose: "stitchr",
      slideCount: 2,
    });

    expect(generation.filledHook).toBe(
      "The reason launch content gets scattered",
    );
    expect(generation.overlayText).toBe(generation.filledHook);
    expect(generation.script).toBe("");
    expect(generation.scenePlan).toEqual([]);
    expect(generation.slides).toEqual([generation.filledHook]);
    expect(generation.caption).toBe("That reaction tells you everything");
    expect(generation.hashtags).toEqual([
      "#launchkit",
      "#creatortips",
      "#ugc",
      "#productdemo",
      "#adcreative",
    ]);
    expect(generation.socialCaption).toBe(
      "That reaction tells you everything\n\n#launchkit #creatortips #ugc #productdemo #adcreative",
    );
    expect(generation.variablesUsed).toEqual({
      topic: "launch ops",
    });
    expect(generation.hookOptions).toEqual([
      {
        angle: "Best match",
        caption: "That reaction tells you everything",
        socialCaption:
          "That reaction tells you everything\n\n#launchkit #creatortips #ugc #productdemo #adcreative",
        templateId: "MG-001",
        text: "The reason launch content gets scattered",
      },
    ]);
  });

  it("keeps three distinct grounded Stitchr options with the winner first", () => {
    const generation = parseCliprTextGenerationOutput({
      candidates,
      durationSeconds: 30,
      outputText: JSON.stringify({
        caption: "The reaction makes sense once the workflow gets clearer.",
        filledHook: "When the messy part finally clicks",
        hashtags: ["launch", "workflow", "founders"],
        hookOptions: [
          {
            angle: "Bold",
            caption: "A launch process should make the next step obvious.",
            templateId: "PB-001",
            text: "Your launch process should not look this hard",
          },
          {
            angle: "Relatable",
            caption:
              "The reaction makes sense once the workflow gets clearer.",
            templateId: "DD-001",
            text: "When the messy part finally clicks",
          },
          {
            angle: "Curiosity",
            caption: "The calm launch starts before the visible work.",
            templateId: "MG-001",
            text: "The step nobody sees before launch day",
          },
          {
            angle: "Duplicate",
            caption: "Duplicate caption.",
            templateId: "DD-001",
            text: "When the messy part finally clicks",
          },
        ],
        overlayText: "When the messy part finally clicks",
        templateId: "DD-001",
      }),
      providerModel: "openai/gpt-4.1",
      product,
      purpose: "stitchr",
      slideCount: 1,
    });

    expect(generation.hookTemplateId).toBe("DD-001");
    expect(generation.hookOptions).toEqual([
      {
        angle: "Relatable",
        caption: "The reaction makes sense once the workflow gets clearer.",
        socialCaption:
          "The reaction makes sense once the workflow gets clearer.\n\n#launch #workflow #founders #launchkit #ugc",
        templateId: "DD-001",
        text: "When the messy part finally clicks",
      },
      {
        angle: "Bold",
        caption: "A launch process should make the next step obvious.",
        socialCaption:
          "A launch process should make the next step obvious.\n\n#launch #workflow #founders #launchkit #ugc",
        templateId: "PB-001",
        text: "Your launch process should not look this hard",
      },
      {
        angle: "Curiosity",
        caption: "The calm launch starts before the visible work.",
        socialCaption:
          "The calm launch starts before the visible work.\n\n#launch #workflow #founders #launchkit #ugc",
        templateId: "MG-001",
        text: "The step nobody sees before launch day",
      },
    ]);
  });

  it("falls back Stitchr captions and hashtags when the model omits them", () => {
    const generation = parseCliprTextGenerationOutput({
      candidates,
      durationSeconds: 30,
      outputText: JSON.stringify({
        filledHook: "I was not expecting that",
      }),
      providerModel: "openai/gpt-4.1",
      product,
      purpose: "stitchr",
      slideCount: 2,
    });

    expect(generation.caption).toBe("I was not expecting that");
    expect(generation.hashtags.length).toBeGreaterThanOrEqual(3);
    expect(generation.hashtags.length).toBeLessThanOrEqual(5);
    expect(generation.socialCaption).toContain("I was not expecting that");
  });

  it("fills sparse Swipr slide decks with support and CTA fallbacks", () => {
    const generation = parseCliprTextGenerationOutput({
      candidates,
      durationSeconds: 30,
      outputText: JSON.stringify({
        filledHook: "The launch mistake nobody talks about",
        slides: ["The launch mistake nobody talks about"],
      }),
      providerModel: "openai/gpt-4.1",
      product: {
        ...product,
        inferredPainPoints: [],
        inferredProblem: "launch work gets scattered.",
        productDetails: "",
      },
      purpose: "swipr",
      slideCount: 4,
    });

    expect(generation.slides).toEqual([
      "The launch mistake nobody talks about",
      "It usually starts as launch work gets scattered",
      "Then the workaround becomes the routine",
      "Follow for more like this",
    ]);
  });

  it("falls back to product context when generated Swipr hooks are unreadable", () => {
    const generation = parseCliprTextGenerationOutput({
      candidates,
      durationSeconds: 30,
      outputText: JSON.stringify({
        filledHook: "The the",
      }),
      providerModel: "openai/gpt-4.1",
      product,
      purpose: "swipr",
      slideCount: 1,
    });

    expect(generation.filledHook).toBe(
      "Start here: launch content gets scattered",
    );
    expect(generation.slides).toEqual([
      "Start here: launch content gets scattered",
    ]);
  });
});
