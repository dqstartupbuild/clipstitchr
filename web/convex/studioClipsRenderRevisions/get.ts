import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioClipsActiveProduct } from "../studioClipsTasks/assertStudioClipsActiveProduct";
import { assertStudioClipsIdentifier } from "../studioClipsTasks/assertStudioClipsIdentifier";
import { getStudioClipsRenderRevisionForOwnerProduct } from "./getStudioClipsRenderRevisionForOwnerProduct";
import { toStudioClipsRenderRevisionSummary } from "./toStudioClipsRenderRevisionSummary";

export const get = query({
  args: { id: v.string(), productId: v.string() },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    await assertStudioBetaAccess(ctx, ownerId);
    const productId = assertStudioClipsIdentifier(args.productId, "Product ID");
    await assertStudioClipsActiveProduct(ctx, ownerId, productId);
    const id = assertStudioClipsIdentifier(args.id, "Render revision ID");
    const value = await getStudioClipsRenderRevisionForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );
    return value ? toStudioClipsRenderRevisionSummary(value) : null;
  },
});
