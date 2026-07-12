import { describe, expect, it } from "vitest";
import { createHookLabIdeaUseLifecycleAnalyticsProperties } from "@/lib/clipstitchr/analytics/createHookLabIdeaUseLifecycleAnalyticsProperties";
import type { HookLabIdeaUseProgress } from "@/lib/clipstitchr/types/HookLabIdeaUseProgress";

describe("createHookLabIdeaUseLifecycleAnalyticsProperties", () => {
  it("reports only terminal counts and status", () => {
    const progress: HookLabIdeaUseProgress = {
      completedVariantCount: 2,
      failedVariantCount: 1,
      id: "use_private_id",
      progress: 1,
      status: "partial",
      variationCount: 3,
      variants: [
        {
          finishedStitchId: "stitch_private_id",
          id: "variant_private_id",
          status: "completed",
          variantIndex: 0,
        },
      ],
    };

    expect(createHookLabIdeaUseLifecycleAnalyticsProperties(progress)).toEqual({
      completed_variant_count: 2,
      failed_variant_count: 1,
      is_partial: true,
      terminal_status: "partial",
      variation_count: 3,
    });
  });
});
