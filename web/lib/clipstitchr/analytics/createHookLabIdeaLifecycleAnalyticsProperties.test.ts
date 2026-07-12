import { describe, expect, it } from "vitest";
import { createHookLabIdeaLifecycleAnalyticsProperties } from "@/lib/clipstitchr/analytics/createHookLabIdeaLifecycleAnalyticsProperties";
import type { HookLabIdea } from "@/lib/clipstitchr/types/HookLabIdea";

describe("createHookLabIdeaLifecycleAnalyticsProperties", () => {
  it("whitelists non-content analysis metadata", () => {
    const idea: HookLabIdea = {
      attributionName: "creator name",
      attributionUrl: "https://social.example/post",
      canonicalUrl: "https://social.example/canonical",
      createdAt: "2026-07-12T12:00:00.000Z",
      failureMessage: "provider payload leaked here",
      hasCreativeBeat: true,
      hasStitchRecipe: false,
      hasTextPattern: true,
      id: "idea_private_id",
      name: "private idea name",
      originalText: "private source text",
      scope: "product",
      sourcePlatform: "instagram",
      sourceType: "social_link",
      status: "ready",
      updatedAt: "2026-07-12T12:01:00.000Z",
      useCount: 0,
      whatToRepeat: "private analysis",
    };

    expect(createHookLabIdeaLifecycleAnalyticsProperties(idea)).toEqual({
      has_creative_beat: true,
      has_stitch_recipe: false,
      has_text_pattern: true,
      scope: "product",
      source_platform: "instagram",
      source_type: "social_link",
      terminal_status: "ready",
    });
  });
});
