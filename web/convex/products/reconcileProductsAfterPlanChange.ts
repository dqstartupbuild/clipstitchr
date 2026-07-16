import type { MutationCtx } from "../_generated/server";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";

export async function reconcileProductsAfterPlanChange(
  ctx: MutationCtx,
  args: {
    eventId: string;
    now: string;
    ownerId: string;
    planKey: PlanKey;
  },
) {
  const existing = await ctx.db
    .query("productLimitReconciliations")
    .withIndex("by_event", (query) => query.eq("eventId", args.eventId))
    .unique();

  if (existing) {
    return existing.archivedProductIds;
  }

  const products = await ctx.db
    .query("products")
    .withIndex("by_owner_created", (query) => query.eq("ownerId", args.ownerId))
    .collect();
  const activeProductCount = products.filter(
    (product) => !product.archivedAt,
  ).length;
  const policy = getPlanPolicy(args.planKey);
  const overLimitCount = Math.max(0, activeProductCount - policy.productLimit);
  const archivedProductIds: string[] = [];

  await ctx.db.insert("productLimitReconciliations", {
    archivedProductIds,
    createdAt: args.now,
    eventId: args.eventId,
    ownerId: args.ownerId,
    planKey: args.planKey,
    reason:
      overLimitCount === 0
        ? `${policy.name} includes ${policy.productLimit} active ${policy.productLimit === 1 ? "product" : "products"}; the workspace is within its limit.`
        : `${overLimitCount} active ${overLimitCount === 1 ? "product is" : "products are"} over the ${policy.name} limit. Existing products stay available, and the owner must archive products before creating or restoring another.`,
  });

  return archivedProductIds;
}
