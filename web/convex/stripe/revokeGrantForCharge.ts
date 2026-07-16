import type Stripe from "stripe";
import type { MutationCtx } from "../_generated/server";
import { revokeCreditGrant } from "../usage/revokeCreditGrant";
import { getStripeChargeBillingContext } from "./getStripeChargeBillingContext";
import { syncBillingReviewFromPaymentHolds } from "./syncBillingReviewFromPaymentHolds";
import { upsertStripePaymentHold } from "./upsertStripePaymentHold";

export async function revokeGrantForCharge(
  ctx: MutationCtx,
  event: Stripe.Event,
  charge: Stripe.Charge,
  adverse: { kind: "refund" | "dispute"; reason: string },
) {
  const now = new Date(event.created * 1_000).toISOString();
  const context = await getStripeChargeBillingContext(ctx, charge);

  const hold = await upsertStripePaymentHold(ctx, {
    eventCreatedAt: event.created,
    eventId: event.id,
    kind: adverse.kind,
    now,
    ownerId: context.ownerId,
    reason: adverse.reason,
    stripeChargeId: charge.id,
    stripeCustomerId: context.customerId,
    stripeInvoiceId: context.invoiceId,
    stripePaymentIntentId: context.paymentIntentId,
  });

  if (!hold.opened) {
    return [];
  }

  const results = [];

  for (const grant of context.grants) {
    const planKey = context.entitlement?.planKey;

    if (!planKey) {
      throw new Error("Stripe charge entitlement could not be resolved.");
    }

    results.push(
      await revokeCreditGrant(ctx, {
        eventId: event.id,
        grantId: grant.grantId,
        now,
        planKey,
        reason: adverse.reason,
      }),
    );
  }

  await syncBillingReviewFromPaymentHolds(ctx, context.ownerId, now);

  return results;
}
