import type Stripe from "stripe";
import type { MutationCtx } from "../_generated/server";
import { restoreRevokedCreditGrant } from "../usage/restoreRevokedCreditGrant";
import { getStripeChargeBillingContext } from "./getStripeChargeBillingContext";
import { recoverCreditRefillFromCharge } from "./recoverCreditRefillFromCharge";
import { recoverMonthlyGrantFromCharge } from "./recoverMonthlyGrantFromCharge";
import { resolveStripePaymentHold } from "./resolveStripePaymentHold";
import { syncBillingReviewFromPaymentHolds } from "./syncBillingReviewFromPaymentHolds";
import { getStripePaymentHasOpenHold } from "./getStripePaymentHasOpenHold";

export async function restoreGrantForCharge(
  ctx: MutationCtx,
  event: Stripe.Event,
  charge: Stripe.Charge,
  kind: "dispute" | "refund" = "dispute",
) {
  const now = new Date(event.created * 1_000).toISOString();
  const context = await getStripeChargeBillingContext(ctx, charge);

  const resolvedHold = await resolveStripePaymentHold(ctx, {
    chargeId: charge.id,
    eventCreatedAt: event.created,
    eventId: event.id,
    kind,
    now,
    ownerId: context.ownerId,
    stripeCustomerId: context.customerId,
    stripeInvoiceId: context.invoiceId,
    stripePaymentIntentId: context.paymentIntentId,
  });
  const remainingChargeHolds = await ctx.db
    .query("stripePaymentHolds")
    .withIndex("by_charge_status", (query) =>
      query.eq("stripeChargeId", charge.id).eq("status", "open"),
    )
    .collect();
  const paymentHasOpenHold = await getStripePaymentHasOpenHold(ctx, {
    invoiceId: context.invoiceId,
    paymentIntentId: context.paymentIntentId,
  });
  const restored: unknown[] = [];

  if (
    !resolvedHold ||
    resolvedHold.status !== "resolved" ||
    !resolvedHold.resolvedFromOpenHold
  ) {
    return restored;
  }

  if (remainingChargeHolds.length === 0 && !paymentHasOpenHold) {
    const planKey = context.entitlement?.planKey;

    if (!planKey && context.grants.length > 0) {
      throw new Error("Stripe charge entitlement could not be resolved.");
    }

    for (const grant of context.grants) {
      restored.push(
        await restoreRevokedCreditGrant(ctx, {
          eventId: event.id,
          grantId: grant.grantId,
          now,
          planKey: planKey!,
          reason: "Stripe dispute closed in the customer's favor",
        }),
      );
    }

    if (context.grants.length === 0) {
      if (context.invoiceId) {
        restored.push(
          await recoverMonthlyGrantFromCharge(ctx, charge, context.ownerId),
        );
      } else if (context.paymentIntentId) {
        restored.push(await recoverCreditRefillFromCharge(ctx, event, charge));
      } else {
        throw new Error("Stripe grant recovery context is unavailable.");
      }
    }
  }

  await syncBillingReviewFromPaymentHolds(ctx, context.ownerId, now);

  return restored;
}
