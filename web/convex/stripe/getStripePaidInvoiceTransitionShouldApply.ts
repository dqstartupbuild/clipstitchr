import type { MutationCtx } from "../_generated/server";
import { getStripeEntitlementEventShouldApply } from "./getStripeEntitlementEventShouldApply";
import { getStripeEntitlementSourceEvent } from "./getStripeEntitlementSourceEvent";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getStripePaidInvoiceSemanticsShouldApply } from "./getStripePaidInvoiceSemanticsShouldApply";

export async function getStripePaidInvoiceTransitionShouldApply(
  ctx: MutationCtx,
  entitlement: {
    currentPeriodEnd: string;
    currentPeriodStart: string;
    graceEndsAt?: string;
    latestPaidInvoiceId?: string;
    planKey: PlanKey;
    sourceEventCreatedAt: number;
    sourceEventId: string;
    state: "active" | "grace" | "inactive";
    stripeSubscriptionId: string;
  },
  incoming: {
    createdAt: number;
    eventId: string;
    eventType: string;
    invoiceId: string;
    periodEnd: string;
    periodStart: string;
    planKey: PlanKey;
    subscriptionId: string;
  },
) {
  const sourceEvent = await getStripeEntitlementSourceEvent(
    ctx,
    entitlement.sourceEventId,
  );
  const sourceIsTerminal =
    sourceEvent?.eventType === "customer.deleted" ||
    sourceEvent?.eventType === "customer.subscription.deleted";

  if (sourceIsTerminal) {
    if (entitlement.stripeSubscriptionId === incoming.subscriptionId) {
      return false;
    }

    if (incoming.createdAt < entitlement.sourceEventCreatedAt) {
      return false;
    }
  }

  if (entitlement.stripeSubscriptionId !== incoming.subscriptionId) {
    const incomingAt = incoming.createdAt * 1_000;
    const graceEndsAt = entitlement.graceEndsAt
      ? Date.parse(entitlement.graceEndsAt)
      : Number.NaN;
    const periodEndAt = Date.parse(entitlement.currentPeriodEnd);
    const currentAccessEnded =
      entitlement.state === "inactive" ||
      (entitlement.state === "grace" &&
        Number.isFinite(graceEndsAt) &&
        graceEndsAt <= incomingAt) ||
      (entitlement.state === "active" &&
        Number.isFinite(periodEndAt) &&
        periodEndAt <= incomingAt);

    if (!currentAccessEnded) {
      return false;
    }
  }

  const generalTransitionShouldApply = getStripeEntitlementEventShouldApply({
    current: {
      createdAt: entitlement.sourceEventCreatedAt,
      eventId: entitlement.sourceEventId,
      eventType: sourceEvent?.eventType ?? "unknown",
      state: sourceEvent?.state ?? entitlement.state,
    },
    incoming: {
      createdAt: incoming.createdAt,
      eventId: incoming.eventId,
      eventType: incoming.eventType,
      state: "active",
    },
  });

  if (entitlement.latestPaidInvoiceId) {
    if (incoming.createdAt < entitlement.sourceEventCreatedAt) {
      return false;
    }

    return getStripePaidInvoiceSemanticsShouldApply(
      {
        currentPeriodEnd: entitlement.currentPeriodEnd,
        currentPeriodStart: entitlement.currentPeriodStart,
        latestPaidInvoiceId: entitlement.latestPaidInvoiceId,
        planKey: entitlement.planKey,
        stripeSubscriptionId: entitlement.stripeSubscriptionId,
      },
      {
        invoiceId: incoming.invoiceId,
        periodEnd: incoming.periodEnd,
        periodStart: incoming.periodStart,
        planKey: incoming.planKey,
        subscriptionId: incoming.subscriptionId,
      },
    );
  }

  return generalTransitionShouldApply;
}
