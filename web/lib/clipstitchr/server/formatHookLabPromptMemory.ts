import type { HookLabTextBlueprint } from "@/lib/clipstitchr/types/HookLabTextBlueprint";

export function formatHookLabPromptMemory(
  blueprints: HookLabTextBlueprint[] = [],
) {
  if (blueprints.length === 0) {
    return "- No saved Idea patterns yet.";
  }

  return blueprints
    .map((blueprint, index) =>
      [
        `Idea pattern ${index + 1}:`,
        JSON.stringify({
          cadence: blueprint.cadence,
          claimsRequiringSupport: blueprint.claimsRequiringSupport,
          emotionalJob: blueprint.emotionalJob,
          exactReuseConstraints: blueprint.exactReuseConstraints,
          productSpecificTokens: blueprint.productSpecificTokens,
          reusablePattern: blueprint.reusablePattern,
          semanticSlots: blueprint.semanticSlots,
          sourceNiche: blueprint.sourceNiche,
          unresolvedVisualReferences: blueprint.unresolvedVisualReferences,
        }),
      ].join("\n"),
    )
    .join("\n");
}
