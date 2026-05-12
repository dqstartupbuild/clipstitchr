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
  it("normalizes b-roll scene type aliases", () => {
    const generation = parseCliprTextGenerationOutput({
      candidates,
      durationSeconds: 30,
      outputText: JSON.stringify({
        templateId: "MG-001",
        filledHook: "The thing nobody tells you about training",
        scenePlan: [
          {
            sceneType: "b-roll",
            scriptText: "Show the idea with b-roll.",
            visualPrompt: "Checklist on a desk.",
            estimatedDurationSeconds: 8,
          },
        ],
      }),
      providerModel: "openai/gpt-4.1",
      slideCount: 4,
    });

    expect(generation.scenePlan[0]?.sceneType).toBe("b_roll");
  });
});
