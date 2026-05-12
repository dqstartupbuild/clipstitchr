import { describe, expect, it } from "vitest";
import { parseCliprTextGenerationOutput } from "@/lib/clipstitchr/server/parseCliprTextGenerationOutput";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";

const candidates: CliprHookTemplate[] = [
  {
    id: "MG-001",
    styleKey: "mystery_gap",
    template: "The thing nobody tells you about {{topic}}",
    requiredVariables: ["topic"],
    emotionalTrigger: "curiosity",
    bestFor: [],
    riskLevel: "safe",
    active: true,
  },
];

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
});
