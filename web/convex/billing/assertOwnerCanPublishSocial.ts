import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getEffectiveEntitlementForOwner } from "./getEffectiveEntitlementForOwner";

export async function assertOwnerCanPublishSocial(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  now: string,
  scheduledFor?: string,
) {
  const effective = await getEffectiveEntitlementForOwner(ctx, ownerId, now);

  if (!effective) {
    throw new Error("Choose a paid plan before scheduling social posts.");
  }

  if (effective.entitlement.billingReviewRequired) {
    throw new Error(
      "Your billing needs a quick review before you can publish social posts.",
    );
  }

  if (effective.state === "inactive") {
    throw new Error(
      "Your subscription needs attention before you can publish social posts.",
    );
  }

  if (
    scheduledFor &&
    effective.entitlement.cancelAtPeriodEnd &&
    Date.parse(scheduledFor) >=
      Date.parse(effective.entitlement.currentPeriodEnd)
  ) {
    throw new Error(
      "Choose a time before your current subscription period ends.",
    );
  }

  return {
    ...effective.entitlement,
    state: effective.state,
  };
}
