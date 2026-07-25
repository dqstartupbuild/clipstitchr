import { describe, expect, it } from "vitest";
import type { HookLabPostAnalysis } from "@/lib/clipstitchr/types/HookLabPostAnalysis";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { createHookLabCreativeBriefPrompt } from "./createHookLabCreativeBriefPrompt";

describe("createHookLabCreativeBriefPrompt", () => {
  it("treats product details as truth and the reference as structure only", () => {
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

    expect(prompt).toContain(
      "Saved product facts are the only source of truth",
    );
    expect(prompt).toContain(
      "do not claim the saved product has reward-gating or unlocking behavior",
    );
    expect(prompt).toContain(
      "Audience details, emotional narrative, inferred problem, and inferred pain points",
    );
    expect(prompt).toContain(
      "Replace source-specific actions, props, jokes, screens, and demonstrations",
    );
    expect(prompt).toContain(
      "audit every spoken line, on-screen line, demonstration, payoff, and CTA",
    );
    expect(prompt).toContain(
      '"productDetails":"A guided calisthenics workout and progress tracker."',
    );
  });
});
