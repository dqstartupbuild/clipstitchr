import type { MutationCtx } from "../_generated/server";

const PAYMENT_HOLD_REASON_PREFIX = "Stripe payment review:";

export async function syncBillingReviewFromPaymentHolds(
  ctx: MutationCtx,
  ownerId: string,
  now: string,
) {
  const [entitlement, openHolds] = await Promise.all([
    ctx.db
      .query("billingEntitlements")
      .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
      .unique(),
    ctx.db
      .query("stripePaymentHolds")
      .withIndex("by_owner_status", (query) =>
        query.eq("ownerId", ownerId).eq("status", "open"),
      )
      .collect(),
  ]);

  if (!entitlement) {
    return null;
  }

  const ownsCurrentReview =
    entitlement.billingReviewReason?.startsWith(PAYMENT_HOLD_REASON_PREFIX) ??
    false;

  if (openHolds.length > 0) {
    if (entitlement.billingReviewRequired && !ownsCurrentReview) {
      return entitlement._id;
    }

    await ctx.db.patch(entitlement._id, {
      billingReviewReason: `${PAYMENT_HOLD_REASON_PREFIX} ${openHolds.length} unresolved ${openHolds.length === 1 ? "payment" : "payments"}.`,
      billingReviewRequired: true,
      updatedAt: now,
      version: entitlement.version + 1,
    });
    return entitlement._id;
  }

  if (entitlement.billingReviewRequired && ownsCurrentReview) {
    await ctx.db.patch(entitlement._id, {
      billingReviewReason: undefined,
      billingReviewRequired: false,
      updatedAt: now,
      version: entitlement.version + 1,
    });
  }

  return entitlement._id;
}
