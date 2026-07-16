import type Stripe from "stripe";
import type { MutationCtx } from "../_generated/server";
import { restoreRevokedCreditGrant } from "../usage/restoreRevokedCreditGrant";
import { getStripeResourceId } from "./getStripeResourceId";

export async function restoreGrantForCharge(
  ctx: MutationCtx,
  event: Stripe.Event,
  charge: Stripe.Charge,
) {
  const paymentIntentId = getStripeResourceId(charge.payment_intent);

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
    return null;
  }

  const entitlement = await ctx.db
    .query("billingEntitlements")
    .withIndex("by_owner", (query) => query.eq("ownerId", grant.ownerId))
    .unique();

  if (!entitlement) {
    return null;
  }

  return await restoreRevokedCreditGrant(ctx, {
    eventId: event.id,
    grantId: grant.grantId,
    now: new Date(event.created * 1_000).toISOString(),
    planKey: entitlement.planKey,
    reason: "Stripe dispute closed in the customer's favor",
  });
}
