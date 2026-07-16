import type Stripe from "stripe";
import type { MutationCtx } from "../_generated/server";
import { STRIPE_GRACE_PERIOD_MS } from "../../lib/clipstitchr/billing/stripeGracePeriodMs";
import { getStripeSubscriptionSnapshot } from "./getStripeSubscriptionSnapshot";
import { getEntitlementStateForSubscriptionStatus } from "./getEntitlementStateForSubscriptionStatus";
import { resolveStripeOwnerId } from "./resolveStripeOwnerId";
import { writeEntitlementHistory } from "./writeEntitlementHistory";

export async function syncEntitlementFromSubscription(
  ctx: MutationCtx,
  event: Stripe.Event,
  subscription: Stripe.Subscription,
) {
  const snapshot = getStripeSubscriptionSnapshot(subscription);
  const ownerId = await resolveStripeOwnerId(ctx, {
    customerId: snapshot.customerId,
    metadataOwnerId: snapshot.ownerId,
    subscriptionId: snapshot.subscriptionId,
  });
  const existing = await ctx.db
    .query("billingEntitlements")
    .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
    .unique();

  if (
    existing &&
    existing.latestSubscriptionEventCreatedAt > event.created
  ) {
    return existing._id;
  }

  const now = new Date(event.created * 1_000).toISOString();
  const state = getEntitlementStateForSubscriptionStatus(
    snapshot.status,
    Boolean(existing?.latestPaidInvoiceId),
  );
  const graceEndsAt =
    state === "grace"
      ? existing?.graceEndsAt && Date.parse(existing.graceEndsAt) > Date.parse(now)
        ? existing.graceEndsAt
        : new Date(
            event.created * 1_000 + STRIPE_GRACE_PERIOD_MS,
          ).toISOString()
      : undefined;
  const planChanged = Boolean(
    existing && existing.planKey !== snapshot.planKey,
  );
  const deferPlanChange = Boolean(
    existing &&
      planChanged &&
      (existing.state === "active" || existing.state === "grace") &&
      (snapshot.status === "active" || snapshot.status === "past_due"),
  );

  if (!existing) {
    const entitlementId = await ctx.db.insert("billingEntitlements", {
      billingReviewRequired: false,
      cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
      createdAt: now,
      currentPeriodEnd: snapshot.periodEnd,
      currentPeriodStart: snapshot.periodStart,
      graceEndsAt,
      lastPaymentAt: undefined,
      latestPaidInvoiceId: undefined,
      latestPaymentEventCreatedAt: 0,
      latestSubscriptionEventCreatedAt: event.created,
      ownerId,
      planKey: snapshot.planKey,
      sourceEventCreatedAt: event.created,
      sourceEventId: event.id,
      state,
      stripeCustomerId: snapshot.customerId,
      stripePriceId: snapshot.priceId,
      stripeSubscriptionId: snapshot.subscriptionId,
      updatedAt: now,
      version: 1,
    });
    await writeEntitlementHistory(ctx, {
      createdAt: now,
      eventCreatedAt: event.created,
      eventId: event.id,
      eventType: event.type,
      ownerId,
      planKey: snapshot.planKey,
      reason: `Stripe subscription ${snapshot.status}`,
      state,
    });

    return entitlementId;
  }

  const periodPatch =
    snapshot.periodStart <= existing.currentPeriodStart ||
    !existing.latestPaidInvoiceId
      ? {
          currentPeriodEnd: snapshot.periodEnd,
          currentPeriodStart: snapshot.periodStart,
        }
      : {};
  const planPatch = deferPlanChange
    ? {
        pendingPlanKey: snapshot.planKey,
        pendingStripePriceId: snapshot.priceId,
      }
    : {
        pendingPlanKey: undefined,
        pendingStripePriceId: undefined,
        planKey: snapshot.planKey,
        stripePriceId: snapshot.priceId,
      };

  await ctx.db.patch(existing._id, {
    ...periodPatch,
    ...planPatch,
    cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
    graceEndsAt,
    latestSubscriptionEventCreatedAt: event.created,
    sourceEventCreatedAt: event.created,
    sourceEventId: event.id,
    state,
    stripeCustomerId: snapshot.customerId,
    stripeSubscriptionId: snapshot.subscriptionId,
    updatedAt: now,
    version: existing.version + 1,
  });
  await writeEntitlementHistory(ctx, {
    createdAt: now,
    eventCreatedAt: event.created,
    eventId: event.id,
    eventType: event.type,
    ownerId,
    planKey: deferPlanChange ? existing.planKey : snapshot.planKey,
    previousPlanKey: existing.planKey,
    previousState: existing.state,
    reason: deferPlanChange
      ? `Stripe plan change pending paid invoice; subscription ${snapshot.status}`
      : `Stripe subscription ${snapshot.status}`,
    state,
  });

  return existing._id;
}
