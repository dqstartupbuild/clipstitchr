import type { StitchrNormalOutputPlan } from "@/lib/clipstitchr/types/StitchrNormalOutputPlan";

export function getStitchrNormalOutputPlans(
  ugcClipIds: string[],
  demoClipId: string | null,
): StitchrNormalOutputPlan[] {
  if (ugcClipIds.length) {
    return ugcClipIds.map((ugcClipId) => ({
      sourceClipIds: demoClipId ? [ugcClipId, demoClipId] : [ugcClipId],
    }));
  }

  return demoClipId ? [{ sourceClipIds: [demoClipId] }] : [];
}
