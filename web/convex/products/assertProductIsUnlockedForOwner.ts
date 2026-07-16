import { ConvexError } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import { getProductAccessStateForOwner } from "./getProductAccessStateForOwner";

export async function assertProductIsUnlockedForOwner(
  ctx: MutationCtx,
  ownerId: string,
  productId: string,
  now: string,
) {
  const access = await getProductAccessStateForOwner(ctx, ownerId, now);

  if (access.lockedProductIds.includes(productId)) {
    throw new ConvexError({
      code: "PRODUCT_LOCKED",
      message: `${access.planName ?? "Your plan"} keeps this product saved, but it needs an open product slot before you can select it. Review your subscription to unlock it.`,
      planName: access.planName,
      productLimit: access.productLimit,
    });
  }
}
