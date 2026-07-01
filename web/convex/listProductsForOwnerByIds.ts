import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { getProductForOwner } from "./getProductForOwner";

export async function listProductsForOwnerByIds(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  productIds: string[],
  limit: number,
) {
  const uniqueProductIds = [...new Set(productIds)].slice(0, limit);
  const products = await Promise.all(
    uniqueProductIds.map((productId) =>
      getProductForOwner(ctx, ownerId, productId),
    ),
  );

  return products
    .filter((product): product is Doc<"products"> => Boolean(product))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
