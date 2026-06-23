import type { StitchrHookPlan } from "@/lib/clipstitchr/types/StitchrHookPlan";

export function filterStitchrHookPlansByProductId(
  plans: StitchrHookPlan[],
  productId: string,
) {
  const normalizedProductId = productId.trim();

  return normalizedProductId
    ? plans.filter((plan) => plan.productId === normalizedProductId)
    : plans;
}
