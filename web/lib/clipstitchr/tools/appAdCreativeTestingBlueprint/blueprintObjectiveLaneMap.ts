import type { BlueprintLaneKey } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintLaneKey";
import type { BlueprintTestingObjective } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintTestingObjective";

export const blueprintObjectiveLaneMap: Record<
  BlueprintTestingObjective,
  [BlueprintLaneKey, BlueprintLaneKey, BlueprintLaneKey]
> = {
  "winning-message": ["audience-message", "hook", "proof-objection"],
  opening: ["hook", "visual-opening", "demo-clarity"],
  "product-proof": ["demo-clarity", "proof-objection", "cta"],
  "conversion-intent": ["proof-objection", "cta", "audience-message"],
  "creative-refresh": ["refresh", "visual-opening", "hook"],
};
