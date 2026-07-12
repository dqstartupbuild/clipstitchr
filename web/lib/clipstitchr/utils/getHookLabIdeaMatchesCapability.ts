import type { HookLabIdea } from "@/lib/clipstitchr/types/HookLabIdea";
import type { HookLabIdeaCapabilityFilter } from "@/lib/clipstitchr/types/HookLabIdeaCapabilityFilter";

export function getHookLabIdeaMatchesCapability(
  idea: HookLabIdea,
  filter: HookLabIdeaCapabilityFilter,
) {
  if (filter === "creative_beat") {
    return idea.hasCreativeBeat;
  }

  if (filter === "saved_setup") {
    return idea.hasStitchRecipe;
  }

  if (filter === "text") {
    return idea.hasTextPattern;
  }

  return true;
}
