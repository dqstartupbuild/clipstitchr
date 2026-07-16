import type { EntitlementState } from "../../lib/clipstitchr/billing/types/EntitlementState";
import { getStripeEntitlementEventPriority } from "./getStripeEntitlementEventPriority";

type StripeEntitlementEvent = {
  createdAt: number;
  eventId: string;
  eventType: string;
  state: EntitlementState;
};

export function getStripeEntitlementEventShouldApply({
  current,
  incoming,
}: {
  current: StripeEntitlementEvent;
  incoming: StripeEntitlementEvent;
}) {
  if (incoming.createdAt !== current.createdAt) {
    return incoming.createdAt > current.createdAt;
  }

  const currentPriority = getStripeEntitlementEventPriority(current);
  const incomingPriority = getStripeEntitlementEventPriority(incoming);

  if (incomingPriority !== currentPriority) {
    return incomingPriority > currentPriority;
  }

  return false;
}
