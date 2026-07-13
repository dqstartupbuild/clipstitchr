import type { BlueprintMetricDirection } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintMetricDirection";

export function getBlueprintImprovementPhrase(
  direction: BlueprintMetricDirection,
): string {
  return direction === "higher" ? "increase" : "decrease";
}
