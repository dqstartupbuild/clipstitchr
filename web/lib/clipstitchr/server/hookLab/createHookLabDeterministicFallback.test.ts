import { describe, expect, it } from "vitest";
import { createHookLabDeterministicFallback } from "@/lib/clipstitchr/server/hookLab/createHookLabDeterministicFallback";
import type { HookLabTextBlueprint } from "@/lib/clipstitchr/types/HookLabTextBlueprint";

const blueprint: HookLabTextBlueprint = {
  cadence: "short callout",
  claimsRequiringSupport: [],
  emotionalJob: "recognition",
  exactReuseConstraints: ["needs a clear visual referent"],
  productSpecificTokens: [],
  reusablePattern: "If {{audience}} feels stuck, try {{product}}",
  semanticSlots: [
    { fallbackValue: "busy founders", meaning: "the viewer", name: "audience" },
    { fallbackValue: "a simple plan", meaning: "the useful product", name: "product" },
  ],
  sourceNiche: "fitness",
  sourceText: "If your boyfriend looks like this…",
  unresolvedVisualReferences: ["this"],
};

describe("createHookLabDeterministicFallback", () => {
  it("fills structured slots deterministically", () => {
    expect(
      createHookLabDeterministicFallback({
        blueprint,
        slotValues: {
          audience: "your workouts",
          product: "this simple plan",
        },
      }),
    ).toBe("If your workouts feels stuck, try this simple plan");
  });

  it("uses a safe topic fallback when the pattern remains too close", () => {
    expect(
      createHookLabDeterministicFallback({
        blueprint: {
          ...blueprint,
          reusablePattern: blueprint.sourceText,
        },
        fallbackTopic: "launch planning",
      }),
    ).toBe("The part of launch planning most people miss");
  });
});
