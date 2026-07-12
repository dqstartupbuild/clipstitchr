import type { HookLabIdea } from "@/lib/clipstitchr/types/HookLabIdea";

export function createHookLabIdeaLifecycleAnalyticsProperties(
  idea: HookLabIdea,
) {
  return {
    has_creative_beat: idea.hasCreativeBeat,
    has_stitch_recipe: idea.hasStitchRecipe,
    has_text_pattern: idea.hasTextPattern,
    scope: idea.scope,
    source_platform: idea.sourcePlatform,
    source_type: idea.sourceType,
    terminal_status: idea.status,
  };
}
