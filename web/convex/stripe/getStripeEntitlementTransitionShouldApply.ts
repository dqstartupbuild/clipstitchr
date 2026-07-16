import type { MutationCtx } from "../_generated/server";
import type { EntitlementState } from "../../lib/clipstitchr/billing/types/EntitlementState";
import { getStripeEntitlementEventShouldApply } from "./getStripeEntitlementEventShouldApply";
import { getStripeEntitlementSourceEvent } from "./getStripeEntitlementSourceEvent";

export async function getStripeEntitlementTransitionShouldApply(
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
) {
  const sourceEvent = await getStripeEntitlementSourceEvent(
    ctx,
    entitlement.sourceEventId,
  );

  return getStripeEntitlementEventShouldApply({
    current: {
      createdAt: entitlement.sourceEventCreatedAt,
      eventId: entitlement.sourceEventId,
      eventType: sourceEvent?.eventType ?? "unknown",
      state: sourceEvent?.state ?? entitlement.state,
    },
    incoming,
  });
}
