import type { MutationCtx } from "../_generated/server";
import { createAutomaticStitchTemplateFromAcceptedHookPlan } from "./createAutomaticStitchTemplateFromAcceptedHookPlan";
import { getAcceptedHookTextFromPlan } from "./getAcceptedHookTextFromPlan";

export async function createAutomaticStitchTemplateFromAcceptedHookStitch({
  ctx,
  ownerId,
  stitchId,
  updatedAt,
}: {
  ctx: MutationCtx;
  ownerId: string;
  stitchId: string;
  updatedAt: string;
}) {
  const acceptedHookPlans = await ctx.db
    .query("stitchrHookPlans")
    .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
    .filter((q) => q.eq(q.field("stitchId"), stitchId))
    .take(10);
  const acceptedPlan = acceptedHookPlans.find((plan) =>
    Boolean(getAcceptedHookTextFromPlan(plan)),
  );
  const hookText = acceptedPlan
    ? getAcceptedHookTextFromPlan(acceptedPlan)
    : undefined;

  if (!hookText) {
    return null;
  }

  return await createAutomaticStitchTemplateFromAcceptedHookPlan({
    ctx,
    hookText,
    ownerId,
    stitchId,
    updatedAt,
  });
}
