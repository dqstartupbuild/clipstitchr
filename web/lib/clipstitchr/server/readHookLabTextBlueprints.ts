import type { HookLabTextBlueprint } from "@/lib/clipstitchr/types/HookLabTextBlueprint";

export function readHookLabTextBlueprints(
  value: unknown,
): HookLabTextBlueprint[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return [];
    }

    const blueprint = candidate as Record<string, unknown>;
    const requiredStrings = [
      blueprint.cadence,
      blueprint.emotionalJob,
      blueprint.reusablePattern,
      blueprint.sourceText,
    ];
    const requiredArrays = [
      blueprint.claimsRequiringSupport,
      blueprint.exactReuseConstraints,
      blueprint.productSpecificTokens,
      blueprint.semanticSlots,
      blueprint.unresolvedVisualReferences,
    ];

    if (
      requiredStrings.some((field) => typeof field !== "string") ||
      requiredArrays.some((field) => !Array.isArray(field))
    ) {
      return [];
    }

    return [candidate as HookLabTextBlueprint];
  });
}
