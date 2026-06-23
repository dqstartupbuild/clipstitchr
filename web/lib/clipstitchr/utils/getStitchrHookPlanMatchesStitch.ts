import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchrHookPlan } from "@/lib/clipstitchr/types/StitchrHookPlan";
import { getStitchrHookPlanMatchesClipPair } from "@/lib/clipstitchr/utils/getStitchrHookPlanMatchesClipPair";

export function getStitchrHookPlanMatchesStitch(
  plan: StitchrHookPlan,
  stitch: Stitch,
) {
  if (plan.stitchId && plan.stitchId === stitch.id) {
    return true;
  }

  return getStitchrHookPlanMatchesClipPair(plan, {
    demoClipId: stitch.demoClipId,
    productId: stitch.productId,
    ugcClipId: stitch.ugcClipId,
  });
}
