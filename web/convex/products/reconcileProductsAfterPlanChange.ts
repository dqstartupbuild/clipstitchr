import type { MutationCtx } from "../_generated/server";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";
import { deleteProductCard } from "../deleteProductCard";
import { disableProductAutomation } from "./disableProductAutomation";

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

  const [products, preferences] = await Promise.all([
    ctx.db
      .query("products")
      .withIndex("by_owner_created", (query) =>
        query.eq("ownerId", args.ownerId),
      )
      .collect(),
    ctx.db
      .query("productPreferences")
      .withIndex("by_owner", (query) => query.eq("ownerId", args.ownerId))
      .unique(),
  ]);
  const defaultProductId = preferences?.defaultProductId;
  const sorted = products
    .filter((product) => !product.archivedAt)
    .sort((left, right) => {
      const leftDefault = left.id === defaultProductId ? 1 : 0;
      const rightDefault = right.id === defaultProductId ? 1 : 0;

      return (
        rightDefault - leftDefault ||
        left.createdAt.localeCompare(right.createdAt) ||
        left.id.localeCompare(right.id)
      );
    });
  const policy = getPlanPolicy(args.planKey);
  const archived = sorted.slice(policy.productLimit);

  for (const product of archived) {
    await ctx.db.patch(product._id, {
      archivedAt: args.now,
      updatedAt: args.now,
    });
    await deleteProductCard(ctx, product);

    await disableProductAutomation(ctx, args.ownerId, product.id, args.now);
  }

  const archivedProductIds = archived.map((product) => product.id);

  await ctx.db.insert("productLimitReconciliations", {
    archivedProductIds,
    createdAt: args.now,
    eventId: args.eventId,
    ownerId: args.ownerId,
    planKey: args.planKey,
    reason: `${policy.name} includes ${policy.productLimit} active ${policy.productLimit === 1 ? "product" : "products"}.`,
  });

  return archivedProductIds;
}
