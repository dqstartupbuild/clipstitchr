import { describe, expect, it } from "vitest";
import { normalizeStitchrHookOptions } from "@/lib/clipstitchr/server/normalizeStitchrHookOptions";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";

const candidates: CliprHookTemplate[] = [
  {
    active: true,
    allowedPurposes: ["stitchr"],
    bestFor: ["reaction content"],
    emotionalTrigger: "recognition",
    id: "UGD-001",
    requiredVariables: ["habit"],
    riskLevel: "safe",
    source: "ugc_discovery_patterns",
    styleKey: "vulnerable_reveal",
    template: "not me realizing {{habit}} was making this harder",
  },
];

describe("normalizeStitchrHookOptions", () => {
  it("keeps creator discoveries and removes brand or voiceover hooks", () => {
    const options = normalizeStitchrHookOptions({
      candidates,
      fallbackCaption: "A little structure changes the whole session.",
      filledHook: "not me realizing random workouts were the problem",
      selectedTemplate: candidates[0],
      value: [
        {
          angle: "Self-callout",
          caption: "A little structure changes the whole session.",
          templateId: "UGD-001",
          text: "not me realizing random workouts were the problem",
        },
        {
          angle: "Explanation",
          caption: "Read the caption for the answer.",
          templateId: "UGD-001",
          text: "If workouts feel aimless, this is why",
        },
        {
          angle: "Product",
          caption: "The app has a plan.",
          templateId: "UGD-001",
          text: "A daily workout that fits your level",
        },
      ],
    });

    expect(options).toHaveLength(1);
    expect(options[0]?.angle).toBe("Self-callout");
  });
});
