import type { StitchrHookPlan } from "@/lib/clipstitchr/types/StitchrHookPlan";

type StitchrHookPlanClipPair = {
  demoClipId?: string;
  productId?: string;
  ugcClipId?: string;
};

export function getStitchrHookPlanMatchesClipPair(
  plan: StitchrHookPlan,
  { demoClipId, productId, ugcClipId }: StitchrHookPlanClipPair,
) {
  const matchesProduct = productId ? plan.productId === productId : true;

  return Boolean(
    ugcClipId &&
      demoClipId &&
      matchesProduct &&
      plan.ugcClipId === ugcClipId &&
      plan.demoClipId === demoClipId,
  );
}
