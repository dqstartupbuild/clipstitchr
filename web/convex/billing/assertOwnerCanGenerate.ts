import type { MutationCtx } from "../_generated/server";
import { getEffectiveEntitlementForOwner } from "./getEffectiveEntitlementForOwner";
import { createUsageError } from "../usage/createUsageError";

export async function assertOwnerCanGenerate(
  ctx: MutationCtx,
  ownerId: string,
  now: string,
) {
  const effective = await getEffectiveEntitlementForOwner(ctx, ownerId, now);

  if (!effective) {
    throw createUsageError({
      code: "SUBSCRIPTION_REQUIRED",
      message: "Choose a plan before starting a new creation.",
    });
  }

  if (effective.entitlement.billingReviewRequired) {
    throw createUsageError({
      code: "BILLING_REVIEW_REQUIRED",
      message: "Your billing needs a quick review before you can create more.",
    });
  }

  if (effective.state === "inactive") {
    throw createUsageError({
      code: "SUBSCRIPTION_INACTIVE",
      message: "Your subscription needs attention before you can create more.",
    });
  }

  return effective.entitlement;
}
