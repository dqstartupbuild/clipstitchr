import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioReelActiveProduct } from "./assertStudioReelActiveProduct";
import { assertStudioReelBoundedString } from "./assertStudioReelBoundedString";

export async function getStudioReelAuthenticatedScope(
  ctx: MutationCtx | QueryCtx,
  productIdValue: string,
) {
  const ownerId = await getAuthenticatedOwnerId(ctx);
  const productId = assertStudioReelBoundedString(productIdValue, {
    label: "Product ID",
    maxLength: 120,
  });

  await assertStudioBetaAccess(ctx, ownerId);
  const product = await assertStudioReelActiveProduct(
    ctx,
    ownerId,
    productId,
  );

  return { ownerId, productId, product };
}
