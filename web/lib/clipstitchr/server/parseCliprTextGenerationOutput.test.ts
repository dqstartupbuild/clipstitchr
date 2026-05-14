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
        estimatedDurationSeconds: 30,
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
      "The small workflow mistake most people miss",
    );
    expect(generation.slides[0]).toBe(generation.filledHook);
  });

  it("forces Swipr slides into a hook, payoff, and product CTA arc", () => {
    const generation = parseCliprTextGenerationOutput({
      candidates,
      durationSeconds: 30,
      outputText: JSON.stringify({
        templateId: "MG-001",
        filledHook: "The launch mistake nobody talks about",
        slides: [
          "The launch mistake nobody talks about",
          "Your files are spread across too many places",
          "Another hook that does not close the loop",
        ],
      }),
      providerModel: "openai/gpt-4.1",
      product,
      purpose: "swipr",
      slideCount: 4,
    });

    expect(generation.slides).toHaveLength(4);
    expect(generation.slides[0]).toBe(generation.filledHook);
    expect(generation.slides.at(-1)).toContain("LaunchKit");
    expect(generation.slides.at(-1)).toMatch(/\bUse\b/);
  });
});
