import type { MutationCtx } from "../_generated/server";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";

export async function reconcileDailyDraftsAfterPlanChange(
  ctx: MutationCtx,
  args: {
    eventId: string;
    now: string;
    ownerId: string;
    planKey: PlanKey;
  },
) {
  const existing = await ctx.db
    .query("dailyDraftLimitReconciliations")
    .withIndex("by_event", (query) => query.eq("eventId", args.eventId))
    .unique();

  if (existing) {
    return existing.disabledProductIds;
  }

  const policy = getPlanPolicy(args.planKey);
  const enabled = await ctx.db
    .query("automationPreferences")
    .withIndex("by_enabled_owner_product", (query) =>
      query.eq("enabled", true).eq("ownerId", args.ownerId),
    )
    .collect();
  const sorted = [...enabled].sort((left, right) => {
    const productComparison = (left.productId ?? "").localeCompare(
      right.productId ?? "",
    );

    return productComparison || left.createdAt.localeCompare(right.createdAt);
  });
  const disabled = sorted.slice(policy.dailyDraftProductLimit);

  for (const preference of disabled) {
    await ctx.db.patch(preference._id, {
      enabled: false,
      preferenceVersion: preference.preferenceVersion + 1,
      updatedAt: args.now,
    });
  }

  const disabledProductIds = disabled
    .map((preference) => preference.productId)
    .filter((productId): productId is string => Boolean(productId));

  await ctx.db.insert("dailyDraftLimitReconciliations", {
    createdAt: args.now,
    disabledProductIds,
    eventId: args.eventId,
    ownerId: args.ownerId,
    planKey: args.planKey,
    reason: `Plan allows daily drafts for ${policy.dailyDraftProductLimit} products.`,
  });

  return disabledProductIds;
}
