import type { MutationCtx } from "../_generated/server";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import type { EntitlementState } from "../../lib/clipstitchr/billing/types/EntitlementState";
import { createSubscriptionCommunication } from "./createSubscriptionCommunication";

export async function createSubscriptionTransitionCommunication(
  ctx: MutationCtx,
  args: {
    eventId: string;
    hadConfirmedPayment: boolean;
    nextCancelAtPeriodEnd: boolean;
    nextState: EntitlementState;
    now: string;
    ownerId: string;
    periodEnd: string;
    planKey: PlanKey;
    previousCancelAtPeriodEnd: boolean;
    previousState: EntitlementState;
    subscriptionId: string;
  },
) {
  if (!args.hadConfirmedPayment) {
    return null;
  }

  if (args.previousState !== "inactive" && args.nextState === "inactive") {
    return await createSubscriptionCommunication(ctx, {
      eventId: args.eventId,
      kind: "ended",
      now: args.now,
      ownerId: args.ownerId,
      periodEnd: args.periodEnd,
      planKey: args.planKey,
      subscriptionId: args.subscriptionId,
    });
  }

  if (
    args.previousCancelAtPeriodEnd !== args.nextCancelAtPeriodEnd &&
    args.nextState !== "inactive"
  ) {
    return await createSubscriptionCommunication(ctx, {
      eventId: args.eventId,
      kind: args.nextCancelAtPeriodEnd
        ? "cancel-scheduled"
        : "cancel-reversed",
      now: args.now,
      ownerId: args.ownerId,
      periodEnd: args.periodEnd,
      planKey: args.planKey,
      subscriptionId: args.subscriptionId,
    });
  }

  return null;
}
