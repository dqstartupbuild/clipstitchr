import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";
import { getUnlockedProductIds } from "../../lib/clipstitchr/products/getUnlockedProductIds";
import { getEffectiveEntitlementForOwner } from "../billing/getEffectiveEntitlementForOwner";

export async function getProductAccessStateForOwner(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  now: string,
) {
  const [products, preferences, effectiveEntitlement] = await Promise.all([
    ctx.db
      .query("products")
      .withIndex("by_owner_archived_created", (query) =>
        query.eq("ownerId", ownerId).eq("archivedAt", undefined),
      )
      .take(100),
    ctx.db
      .query("productPreferences")
      .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
      .unique(),
    getEffectiveEntitlementForOwner(ctx, ownerId, now),
  ]);
  const activeProducts = products;
  const oldestActiveProduct = activeProducts.toSorted(
    (left, right) =>
      left.createdAt.localeCompare(right.createdAt) ||
      left.id.localeCompare(right.id),
  )[0];
  const savedDefaultProductId = activeProducts.some(
    (product) => product.id === preferences?.defaultProductId,
  )
    ? preferences?.defaultProductId
    : undefined;
  const defaultProductId = savedDefaultProductId ?? oldestActiveProduct?.id;

  if (!effectiveEntitlement) {
    return {
      defaultProductId,
      isProductLimitReached: false,
      lockedProductIds: [] as string[],
      planName: null,
      productLimit: null,
    };
  }

  const policy = getPlanPolicy(effectiveEntitlement.entitlement.planKey);
  const unlockedProductIds = new Set(
    getUnlockedProductIds(activeProducts, defaultProductId, policy.productLimit),
  );

  return {
    defaultProductId,
    isProductLimitReached: activeProducts.length >= policy.productLimit,
    lockedProductIds: activeProducts
      .filter((product) => !unlockedProductIds.has(product.id))
      .map((product) => product.id),
    planName: policy.name,
    productLimit: policy.productLimit,
  };
}
