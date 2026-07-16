import type { EntitlementState } from "../../lib/clipstitchr/billing/types/EntitlementState";
import type { MutationCtx } from "../_generated/server";
import { getStripeEntitlementEventPriority } from "./getStripeEntitlementEventPriority";
import { getStripeEntitlementSourceEvent } from "./getStripeEntitlementSourceEvent";

const AUTHORITATIVE_SUBSCRIPTION_EVENT_TYPES = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
]);

export async function getStripeSubscriptionTransitionDisposition(
  ctx: MutationCtx,
  entitlement: {
    sourceEventCreatedAt: number;
    sourceEventId: string;
    state: EntitlementState;
  },
  incoming: {
    createdAt: number;
    eventId: string;
    eventType: string;
    state: EntitlementState;
  },
): Promise<"auxiliary" | "full" | "ignore"> {
  if (incoming.eventId === entitlement.sourceEventId) {
    return "ignore";
  }

  const sourceEvent = await getStripeEntitlementSourceEvent(
    ctx,
    entitlement.sourceEventId,
  );
  const currentEventType = sourceEvent?.eventType ?? "unknown";
  const currentState = sourceEvent?.state ?? entitlement.state;

  if (
    currentEventType === "customer.deleted" ||
    currentEventType === "customer.subscription.deleted"
  ) {
    return "ignore";
  }

  if (incoming.createdAt !== entitlement.sourceEventCreatedAt) {
    return incoming.createdAt > entitlement.sourceEventCreatedAt
      ? "full"
      : "ignore";
  }
  const currentPriority = getStripeEntitlementEventPriority({
    eventType: currentEventType,
    state: currentState,
  });
  const incomingPriority = getStripeEntitlementEventPriority({
    eventType: incoming.eventType,
    state: incoming.state,
  });

  if (incomingPriority !== currentPriority) {
    if (incomingPriority > currentPriority) {
      return "full";
    }

    return AUTHORITATIVE_SUBSCRIPTION_EVENT_TYPES.has(incoming.eventType) &&
      (currentEventType === "invoice.paid" ||
        currentEventType === "invoice.payment_failed" ||
        currentEventType === "invoice.finalization_failed")
      ? "auxiliary"
      : "ignore";
  }

  return AUTHORITATIVE_SUBSCRIPTION_EVENT_TYPES.has(currentEventType) &&
    AUTHORITATIVE_SUBSCRIPTION_EVENT_TYPES.has(incoming.eventType)
    ? "full"
    : "ignore";
}
