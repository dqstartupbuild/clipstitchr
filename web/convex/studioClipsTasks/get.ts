import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioClipsActiveProduct } from "./assertStudioClipsActiveProduct";
import { assertStudioClipsIdentifier } from "./assertStudioClipsIdentifier";
import { getStudioClipsTaskForOwnerProduct } from "./getStudioClipsTaskForOwnerProduct";
import { toStudioClipsTaskDetail } from "./toStudioClipsTaskDetail";

export const get = query({
  args: { id: v.string(), productId: v.string() },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    await assertStudioBetaAccess(ctx, ownerId);
    const productId = assertStudioClipsIdentifier(args.productId, "Product ID");
    await assertStudioClipsActiveProduct(ctx, ownerId, productId);
    const id = assertStudioClipsIdentifier(args.id, "Studio Clips task ID");
    const task = await getStudioClipsTaskForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
    return task ? await toStudioClipsTaskDetail(ctx, task) : null;
  },
});
