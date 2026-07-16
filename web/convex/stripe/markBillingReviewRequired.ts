import type { MutationCtx } from "../_generated/server";

export async function markBillingReviewRequired(
  ctx: MutationCtx,
  ownerId: string,
  reason: string,
  now: string,
) {
  const entitlement = await ctx.db
    .query("billingEntitlements")
    .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
    .unique();

  if (!entitlement) {
    return null;
  }

  await ctx.db.patch(entitlement._id, {
    billingReviewReason: reason,
    billingReviewRequired: true,
    updatedAt: now,
    version: entitlement.version + 1,
  });

  return entitlement._id;
}
