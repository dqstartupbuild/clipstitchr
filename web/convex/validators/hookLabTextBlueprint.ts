import { v } from "convex/values";

export const hookLabTextBlueprintValidator = v.object({
  cadence: v.string(),
  claimsRequiringSupport: v.array(v.string()),
  emotionalJob: v.string(),
  exactReuseConstraints: v.array(v.string()),
  productSpecificTokens: v.array(v.string()),
  reusablePattern: v.string(),
  semanticSlots: v.array(
    v.object({
      fallbackValue: v.optional(v.string()),
      meaning: v.string(),
      name: v.string(),
    }),
  ),
  sourceNiche: v.optional(v.string()),
  sourceText: v.string(),
  unresolvedVisualReferences: v.array(v.string()),
});
