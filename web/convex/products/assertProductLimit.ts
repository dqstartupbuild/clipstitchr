import { ConvexError } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";
import { assertOwnerCanGenerate } from "../billing/assertOwnerCanGenerate";

export async function assertProductLimit(
  ctx: MutationCtx,
  ownerId: string,
  now: string,
) {
  const entitlement = await assertOwnerCanGenerate(ctx, ownerId, now);
  const policy = getPlanPolicy(entitlement.planKey);
  const products = await ctx.db
    .query("products")
    .withIndex("by_owner_created", (query) => query.eq("ownerId", ownerId))
    .collect();
  const activeCount = products.filter((product) => !product.archivedAt).length;

  if (activeCount >= policy.productLimit) {
    throw new ConvexError({
      code: "PRODUCT_LIMIT_REACHED",
      limit: policy.productLimit,
      message: `${policy.name} includes ${policy.productLimit} active ${policy.productLimit === 1 ? "product" : "products"}. Archive one or change your plan to add another.`,
    });
  }
}
