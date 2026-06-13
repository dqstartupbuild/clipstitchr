import { describe, expect, it } from "vitest";
import { createCliprDemoTextGeneration } from "@/lib/clipstitchr/server/createCliprDemoTextGeneration";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

function createProduct(): ProductProfile {
  return {
    audienceDetails: "Solo founders",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    productDetails: "A tool that turns product demos into short videos.",
    updatedAt: "2026-05-20T00:00:00.000Z",
  };
}

describe("createCliprDemoTextGeneration", () => {
  it("creates local Clipr metadata for Demo mode", () => {
    const generation = createCliprDemoTextGeneration({
      demoClipId: "demo_1",
      demoClipName: "Onboarding demo",
      durationSeconds: 8,
      product: createProduct(),
    });

    expect(generation.hookStyleKey).toBe("demo_remix_source");
    expect(generation.hookTemplateId).toBe("DEMO-001");
    expect(generation.scenePlan).toEqual([
      expect.objectContaining({
        sceneType: "demo",
        scriptText: "Silent demo remix using Onboarding demo.",
        estimatedDurationSeconds: 8,
      }),
    ]);
    expect(generation.variablesUsed).toEqual({ demoClipId: "demo_1" });
  });
});
