import { describe, expect, it } from "vitest";
import type { HookLabPostAnalysis } from "@/lib/clipstitchr/types/HookLabPostAnalysis";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { createHookLabCreativeBriefPrompt } from "./createHookLabCreativeBriefPrompt";

describe("createHookLabCreativeBriefPrompt", () => {
  it("preserves compatible execution while replacing unsupported product claims", () => {
    const prompt = createHookLabCreativeBriefPrompt({
      analysis: {
        callToAction: "Download the screen-time app.",
        caption: "Do push-ups to unlock your apps.",
        contentSummary:
          "A creator completes push-ups to unlock social media time.",
        format: "Demonstration",
        onScreenText: ["10 push-ups to unlock"],
        openingHook: "The creator cannot open a social app.",
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
        productDetails: "A guided calisthenics workout and progress tracker.",
        updatedAt: "2026-07-22T00:00:00.000Z",
      } satisfies ProductProfile,
    });

    expect(prompt).toContain("Saved product facts are the only source of truth");
    expect(prompt).toContain(
      "do not claim the saved product has reward-gating or unlocking behavior",
    );
    expect(prompt).toContain(
      "Audience details, emotional narrative, inferred problem, and inferred pain points",
    );
    expect(prompt).toContain("Use minimum necessary adaptation");
    expect(prompt).toContain(
      "Preserve product-neutral actions and props when they still fit",
    );
    expect(prompt).toContain(
      "Treat a visible editor-added overlay differently from app UI",
    );
    expect(prompt).toContain(
      "Do not use audience pain points or emotional narrative as permission",
    );
    expect(prompt).toContain("label every reference element as KEEP, ADAPT, or REMOVE");
    expect(prompt).toContain(
      "keep the distressed wake-up, bedside phone reveal, push-ups",
    );
    expect(prompt).toContain(
      "Do not turn that example into a mirror-transformation ad",
    );
    expect(prompt).toContain(
      "audit every spoken line, on-screen line, demonstration, payoff, and CTA",
    );
    expect(prompt).toContain("Reference preservation contract:");
    expect(prompt).toContain(
      '"productDetails":"A guided calisthenics workout and progress tracker."',
    );
  });
});
