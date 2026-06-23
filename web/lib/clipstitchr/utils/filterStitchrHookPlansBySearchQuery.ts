import type { StitchrHookPlan } from "@/lib/clipstitchr/types/StitchrHookPlan";

export function filterStitchrHookPlansBySearchQuery(
  plans: StitchrHookPlan[],
  searchQuery: string,
) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  if (!normalizedSearchQuery) {
    return plans;
  }

  return plans.filter((plan) =>
    [
      plan.selectedHook,
      plan.caption,
      plan.productName,
      plan.ugcClipName,
      plan.demoClipName,
      plan.hashtags.join(" "),
      plan.hookOptions.map((option) => option.text).join(" "),
    ].some((value) => value?.toLowerCase().includes(normalizedSearchQuery)),
  );
}
