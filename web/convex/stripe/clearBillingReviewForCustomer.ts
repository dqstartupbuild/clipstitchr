import type { MutationCtx } from "../_generated/server";

export async function clearBillingReviewForCustomer(
  ctx: MutationCtx,
  customerId: string,
  now: string,
) {
  const entitlement = await ctx.db
    .query("billingEntitlements")
    .withIndex("by_stripe_customer", (query) =>
      query.eq("stripeCustomerId", customerId),
    )
    .unique();

  if (!entitlement) {
    return null;
  }

  await ctx.db.patch(entitlement._id, {
    billingReviewReason: undefined,
    billingReviewRequired: false,
    updatedAt: now,
    version: entitlement.version + 1,
  });

  return entitlement._id;
}
