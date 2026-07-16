import type Stripe from "stripe";
import type { MutationCtx } from "../_generated/server";
import { revokeCreditGrant } from "../usage/revokeCreditGrant";
import { getStripeResourceId } from "./getStripeResourceId";
import { markBillingReviewRequired } from "./markBillingReviewRequired";

export async function revokeGrantForCharge(
  ctx: MutationCtx,
  event: Stripe.Event,
  charge: Stripe.Charge,
  reason: string,
) {
  const paymentIntentId = getStripeResourceId(charge.payment_intent);
  const now = new Date(event.created * 1_000).toISOString();

  if (!paymentIntentId) {
    return null;
  }

  const grant = await ctx.db
    .query("creditGrants")
    .withIndex("by_payment_intent", (query) =>
      query.eq("stripePaymentIntentId", paymentIntentId),
    )
    .unique();

  if (!grant) {
    const customerId = getStripeResourceId(charge.customer);
    const entitlement = customerId
      ? await ctx.db
          .query("billingEntitlements")
          .withIndex("by_stripe_customer", (query) =>
            query.eq("stripeCustomerId", customerId),
          )
          .unique()
      : null;

    if (entitlement) {
      await markBillingReviewRequired(ctx, entitlement.ownerId, reason, now);
    }

    return null;
  }

  const entitlement = await ctx.db
    .query("billingEntitlements")
    .withIndex("by_owner", (query) => query.eq("ownerId", grant.ownerId))
    .unique();

  if (!entitlement) {
    return null;
  }

  const result = await revokeCreditGrant(ctx, {
    eventId: event.id,
    grantId: grant.grantId,
    now,
    planKey: entitlement.planKey,
    reason,
  });

  if (result.consumedAmount > 0 || reason.includes("dispute")) {
    await markBillingReviewRequired(ctx, grant.ownerId, reason, now);
  }

  return result;
}
