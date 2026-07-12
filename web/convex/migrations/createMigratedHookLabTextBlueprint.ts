import type { HookLabTextBlueprint } from "../../lib/clipstitchr/types/HookLabTextBlueprint";

export function createMigratedHookLabTextBlueprint(
  sourceText: string,
): HookLabTextBlueprint {
  return {
    cadence: "Keep the same short, easy-to-read rhythm.",
    claimsRequiringSupport: [],
    emotionalJob: "Create the same curiosity or recognition without copying blindly.",
    exactReuseConstraints: [
      "Adapt the wording when the product, audience, or visual referent changes.",
    ],
    productSpecificTokens: [],
    reusablePattern: sourceText,
    semanticSlots: [],
    sourceText,
    unresolvedVisualReferences: [],
  };
}
