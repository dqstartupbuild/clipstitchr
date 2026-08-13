import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getStudioBetaAccessStateForOwner } from "../studioBetaAccess/getStudioBetaAccessStateForOwner";
import { getStudioReelExecutionAvailability } from "./getStudioReelExecutionAvailability";

export async function getStudioReelWorkerScopeState(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  productId: string,
) {
  const [access, product] = await Promise.all([
    getStudioBetaAccessStateForOwner(ctx, ownerId),
    ctx.db
      .query("products")
      .withIndex("by_owner_id", (query) =>
        query.eq("ownerId", ownerId).eq("id", productId),
      )
      .unique(),
  ]);
  const execution = getStudioReelExecutionAvailability();
  return {
    execution,
    productOwned: Boolean(product && !product.archivedAt),
    studioAccess: access.hasAccess,
  };
}
