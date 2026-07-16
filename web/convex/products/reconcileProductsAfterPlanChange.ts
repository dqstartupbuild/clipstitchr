import type { MutationCtx } from "../_generated/server";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";
import { getUnlockedProductIds } from "../../lib/clipstitchr/products/getUnlockedProductIds";

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
    return existing.lockedProductIds ?? [];
  }

  const products = await ctx.db
    .query("products")
    .withIndex("by_owner_archived_created", (query) =>
      query.eq("ownerId", args.ownerId).eq("archivedAt", undefined),
    )
    .take(100);
  const activeProductCount = products.length;
  const policy = getPlanPolicy(args.planKey);
  const overLimitCount = Math.max(0, activeProductCount - policy.productLimit);
  const archivedProductIds: string[] = [];
  const preferences = await ctx.db
    .query("productPreferences")
    .withIndex("by_owner", (query) => query.eq("ownerId", args.ownerId))
    .unique();
  const unlockedProductIds = new Set(
    getUnlockedProductIds(
      products,
      preferences?.defaultProductId,
      policy.productLimit,
    ),
  );
  const lockedProductIds = products
    .filter((product) => !unlockedProductIds.has(product.id))
    .map((product) => product.id);

  await ctx.db.insert("productLimitReconciliations", {
    archivedProductIds,
    lockedProductIds,
    createdAt: args.now,
    eventId: args.eventId,
    ownerId: args.ownerId,
    planKey: args.planKey,
    reason:
      overLimitCount === 0
        ? `${policy.name} includes ${policy.productLimit} active ${policy.productLimit === 1 ? "product" : "products"}; the workspace is within its limit.`
        : `${overLimitCount} active ${overLimitCount === 1 ? "product is" : "products are"} over the ${policy.name} limit. The saved default and remaining oldest products stay selectable up to the plan limit; excess products stay saved but locked.`,
  });

  return lockedProductIds;
}
