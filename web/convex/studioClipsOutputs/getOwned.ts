import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioClipsActiveProduct } from "../studioClipsTasks/assertStudioClipsActiveProduct";
import { assertStudioClipsIdentifier } from "../studioClipsTasks/assertStudioClipsIdentifier";
import { getStudioClipsTaskForOwnerProduct } from "../studioClipsTasks/getStudioClipsTaskForOwnerProduct";
import { getStudioClipsOutputForOwnerProduct } from "./getStudioClipsOutputForOwnerProduct";
import { toStudioClipsOutput } from "./toStudioClipsOutput";

export const getOwned = query({
  args: { id: v.string(), productId: v.string(), taskId: v.string() },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    await assertStudioBetaAccess(ctx, ownerId);
    const productId = assertStudioClipsIdentifier(args.productId, "Product ID");
    await assertStudioClipsActiveProduct(ctx, ownerId, productId);
    const taskId = assertStudioClipsIdentifier(args.taskId, "Studio Clips task ID");
    const task = await getStudioClipsTaskForOwnerProduct(
      ctx,
      ownerId,
      productId,
      taskId,
    );
    if (!task) return null;
    const output = await getStudioClipsOutputForOwnerProduct(
      ctx,
      ownerId,
      productId,
      assertStudioClipsIdentifier(args.id, "Studio Clips output ID"),
    );
    return output && output.taskId === taskId ? toStudioClipsOutput(output) : null;
  },
});
