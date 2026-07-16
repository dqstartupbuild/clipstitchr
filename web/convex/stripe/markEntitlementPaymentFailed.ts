import type Stripe from "stripe";
import type { MutationCtx } from "../_generated/server";
import { getStripeEntitlementTransitionShouldApply } from "./getStripeEntitlementTransitionShouldApply";
import { getStripeGraceEndsAt } from "./getStripeGraceEndsAt";
import { getStripeInvoiceFailureShouldApply } from "./getStripeInvoiceFailureShouldApply";
import { getStripeInvoiceSnapshot } from "./getStripeInvoiceSnapshot";
import { resolveStripeOwnerId } from "./resolveStripeOwnerId";
import { writeEntitlementHistory } from "./writeEntitlementHistory";

export async function markEntitlementPaymentFailed(
  ctx: MutationCtx,
  event: Stripe.Event,
  invoice: Stripe.Invoice,
) {
  const snapshot = getStripeInvoiceSnapshot(invoice);
  const ownerId = await resolveStripeOwnerId(ctx, {
    customerId: snapshot.customerId,
    metadataOwnerId: snapshot.ownerId,
    subscriptionId: snapshot.subscriptionId,
  });
  const entitlement = await ctx.db
    .query("billingEntitlements")
    .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
    .unique();

  if (
    !entitlement ||
    !entitlement.latestPaidInvoiceId ||
    entitlement.stripeSubscriptionId !== snapshot.subscriptionId ||
    !getStripeInvoiceFailureShouldApply(
      entitlement.latestPaymentEventCreatedAt,
      event.created,
    ) ||
    !(await getStripeEntitlementTransitionShouldApply(ctx, entitlement, {
      createdAt: event.created,
      eventId: event.id,
      eventType: event.type,
      state: "grace",
    }))
  ) {
    return entitlement?._id;
  }

  const now = new Date(event.created * 1_000).toISOString();
  const graceEndsAt = getStripeGraceEndsAt(
    entitlement.graceEndsAt,
    event.created,
  );

  await ctx.db.patch(entitlement._id, {
    graceEndsAt,
    latestPaymentEventCreatedAt: event.created,
    sourceEventCreatedAt: event.created,
    sourceEventId: event.id,
    state: "grace",
    updatedAt: now,
    version: entitlement.version + 1,
  });
  await writeEntitlementHistory(ctx, {
    createdAt: now,
    eventCreatedAt: event.created,
    eventId: event.id,
    eventType: event.type,
    ownerId,
    planKey: entitlement.planKey,
    previousPlanKey: entitlement.planKey,
    previousState: entitlement.state,
    reason:
      event.type === "invoice.finalization_failed"
        ? "Stripe invoice finalization failed; 72-hour grace started"
        : "Stripe invoice payment failed; 72-hour grace started",
    state: "grace",
  });

  return entitlement._id;
}
