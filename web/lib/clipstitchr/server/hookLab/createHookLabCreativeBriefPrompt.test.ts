import { describe, expect, it } from "vitest";
import type { HookLabPostAnalysis } from "@/lib/clipstitchr/types/HookLabPostAnalysis";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { createHookLabCreativeBriefPrompt } from "./createHookLabCreativeBriefPrompt";

describe("createHookLabCreativeBriefPrompt", () => {
  it("does not instruct the model to suppress product claims", () => {
    const prompt = createHookLabCreativeBriefPrompt({
      analysis: {
        callToAction: "Try it",
        caption: "Reference caption",
        contentSummary: "A creator demonstrates a workflow.",
        format: "Demonstration",
        onScreenText: [],
        openingHook: "Watch this",
        performance: {
          confidence: "Medium",
          engagementExplanation: "Not evaluated",
          hookScore: 8,
          limitations: [],
          overallScore: 8,
          pacingScore: 8,
          platformFitScore: 8,
          retentionExplanation: "Not evaluated",
          strengths: [],
        },
        timeline: [],
        transferableLessons: [],
      } satisfies HookLabPostAnalysis,
      product: {
        audienceDetails: "Busy creators",
        createdAt: "2026-07-22T00:00:00.000Z",
        id: "product_1",
        inferredPainPoints: [],
        name: "Launch Kit",
        productDetails: "A creative workflow",
        updatedAt: "2026-07-22T00:00:00.000Z",
      } satisfies ProductProfile,
    });

    expect(prompt).not.toContain("does not support a claim");
    expect(prompt).not.toContain("Do not invent a result");
    expect(prompt).not.toContain("supported behavior");
  });
});
