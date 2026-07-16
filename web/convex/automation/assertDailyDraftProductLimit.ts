import { ConvexError } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";
import { assertOwnerCanGenerate } from "../billing/assertOwnerCanGenerate";

export async function assertDailyDraftProductLimit(
  ctx: MutationCtx,
  ownerId: string,
  productId: string | undefined,
  now: string,
) {
  const entitlement = await assertOwnerCanGenerate(ctx, ownerId, now);
  const policy = getPlanPolicy(entitlement.planKey);
  const enabledPreferences = await ctx.db
    .query("automationPreferences")
    .withIndex("by_enabled_owner_product", (query) =>
      query.eq("enabled", true).eq("ownerId", ownerId),
    )
    .collect();
  const enabledOnOtherProducts = enabledPreferences.filter(
    (preference) => preference.productId !== productId,
  ).length;

  if (enabledOnOtherProducts >= policy.dailyDraftProductLimit) {
    throw new ConvexError({
      code: "DAILY_DRAFT_PRODUCT_LIMIT_REACHED",
      limit: policy.dailyDraftProductLimit,
      message:
        policy.dailyDraftProductLimit === 0
          ? "Daily drafts are available on Pro and Agency plans."
          : `${policy.name} includes daily drafts for ${policy.dailyDraftProductLimit} ${policy.dailyDraftProductLimit === 1 ? "product" : "products"}. Turn them off for another product or change your plan.`,
    });
  }
}
