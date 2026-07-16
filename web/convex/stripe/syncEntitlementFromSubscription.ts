import type Stripe from "stripe";
import type { MutationCtx } from "../_generated/server";
import { getStripeSubscriptionSnapshot } from "./getStripeSubscriptionSnapshot";
import { getEntitlementStateForSubscriptionStatus } from "./getEntitlementStateForSubscriptionStatus";
import { getStripeGraceEndsAt } from "./getStripeGraceEndsAt";
import { getStripeSubscriptionTransitionDisposition } from "./getStripeSubscriptionTransitionDisposition";
import { resolveStripeOwnerId } from "./resolveStripeOwnerId";
import { writeEntitlementHistory } from "./writeEntitlementHistory";
import { cancelNeverStartedQueueForOwner } from "../workerQueue/cancelNeverStartedQueueForOwner";

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
  if (existing && existing.stripeSubscriptionId !== snapshot.subscriptionId) {
    return existing._id;
  }

  const hasConfirmedPayment = Boolean(existing?.latestPaidInvoiceId);
  const subscriptionState = getEntitlementStateForSubscriptionStatus(
    snapshot.status,
    hasConfirmedPayment,
  );
  const state =
    existing?.state === "grace" && subscriptionState === "active"
      ? "grace"
      : subscriptionState;

  if (
    existing &&
    (existing.latestSubscriptionEventCreatedAt ?? 0) > event.created
  ) {
    return existing._id;
  }

  const now = new Date(event.created * 1_000).toISOString();
  const graceEndsAt =
    state === "grace"
      ? getStripeGraceEndsAt(existing?.graceEndsAt, event.created)
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
  const transitionDisposition = existing
    ? await getStripeSubscriptionTransitionDisposition(ctx, existing, {
        createdAt: event.created,
        eventId: event.id,
        eventType: event.type,
        state,
      })
    : "full";

  if (existing && transitionDisposition === "ignore") {
    return existing._id;
  }

  if (existing && transitionDisposition === "auxiliary") {
    await ctx.db.patch(existing._id, {
      cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
      ...(planChanged &&
      (snapshot.status === "active" || snapshot.status === "past_due")
        ? {
            pendingPlanKey: snapshot.planKey,
            pendingStripePriceId: snapshot.priceId,
          }
        : {
            pendingPlanKey: undefined,
            pendingStripePriceId: undefined,
          }),
      latestSubscriptionEventCreatedAt: event.created,
      updatedAt: now,
      version: existing.version + 1,
    });
    await writeEntitlementHistory(ctx, {
      createdAt: now,
      eventCreatedAt: event.created,
      eventId: event.id,
      eventType: event.type,
      ownerId,
      planKey: existing.planKey,
      previousPlanKey: existing.planKey,
      previousState: existing.state,
      reason:
        "Authoritative Stripe subscription schedule refreshed without replacing higher-priority entitlement state",
      state: existing.state,
    });

    return existing._id;
  }

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
    if (state === "inactive") {
      await cancelNeverStartedQueueForOwner(ctx, {
        now,
        ownerId,
        reason: "Subscription ended before this work started.",
      });
    }

    return entitlementId;
  }

  const periodPatch =
    snapshot.periodStart <= existing.currentPeriodStart || !hasConfirmedPayment
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
  if (state === "inactive") {
    await cancelNeverStartedQueueForOwner(ctx, {
      now,
      ownerId,
      reason: "Subscription ended before this work started.",
    });
  }

  return existing._id;
}
