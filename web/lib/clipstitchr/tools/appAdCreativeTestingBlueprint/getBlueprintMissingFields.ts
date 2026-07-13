import type { AppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintInput";

export function getBlueprintMissingFields(
  input: AppAdCreativeTestingBlueprintInput,
): string[] {
  return [
    ["App name", input.appName],
    ["Audience", input.audience],
    ["Product outcome", input.productOutcome],
    ["Main objection", input.mainObjection],
    ["Primary metric", input.primaryMetric],
  ]
    .filter(([, value]) => !value.trim())
    .map(([label]) => label);
}
