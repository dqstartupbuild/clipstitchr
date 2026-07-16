import { getCanonicalPaidStripeAccessIsActive } from "../../lib/clipstitchr/billing/getCanonicalPaidStripeAccessIsActive";
import { getEffectiveEntitlementState } from "../../lib/clipstitchr/billing/getEffectiveEntitlementState";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { query } from "../_generated/server";

export const getCurrentEntitlement = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const entitlement = await ctx.db
      .query("billingEntitlements")
      .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
      .unique();

    if (!entitlement) {
      return null;
    }

    const now = new Date().toISOString();
    const policy = getPlanPolicy(entitlement.planKey);
    const state = getEffectiveEntitlementState(entitlement, now);

    return {
      activeGenerationLimit: policy.activeGenerationLimit,
      billingReviewRequired: entitlement.billingReviewRequired,
      canBuyRefill:
        state === "active" &&
        getCanonicalPaidStripeAccessIsActive(entitlement, now),
      cancelAtPeriodEnd: entitlement.cancelAtPeriodEnd,
      currentPeriodEnd: entitlement.currentPeriodEnd,
      currentPeriodStart: entitlement.currentPeriodStart,
      dailyDraftProductLimit: policy.dailyDraftProductLimit,
      graceEndsAt: entitlement.graceEndsAt,
      pendingPlanKey: entitlement.pendingPlanKey,
      planKey: entitlement.planKey,
      planName: policy.name,
      productLimit: policy.productLimit,
      queueLabel: policy.queueLabel,
      state,
    };
  },
});
