import type { AppAdShotListInput } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListInput";

export function getAppAdShotListMissingFields(input: AppAdShotListInput) {
  const requiredFields: Array<[keyof AppAdShotListInput, string]> = [
    ["appName", "app name"],
    ["audience", "audience"],
    ["problem", "frustrating moment"],
    ["productMoment", "product-demo moment"],
    ["desiredOutcome", "desired outcome"],
    ["callToAction", "call to action"],
  ];

  return requiredFields
    .filter(([key]) => String(input[key]).trim().length === 0)
    .map(([, label]) => label);
}
