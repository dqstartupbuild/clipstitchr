import type { HookLabIdeaUseProgress } from "@/lib/clipstitchr/types/HookLabIdeaUseProgress";

export function createHookLabIdeaUseLifecycleAnalyticsProperties(
  progress: HookLabIdeaUseProgress,
) {
  return {
    completed_variant_count: progress.completedVariantCount,
    failed_variant_count: progress.failedVariantCount,
    is_partial: progress.status === "partial",
    terminal_status: progress.status,
    variation_count: progress.variationCount,
  };
}
