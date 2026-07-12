import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { query } from "../_generated/server";
import { getHookLabPromptBlueprints } from "./getHookLabPromptBlueprints";

export const listPromptMemory = query({
  args: {
    productId: v.string(),
  },
  handler: async (ctx, { productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const normalizedProductId = productId.trim();
    const product = await ctx.db
      .query("products")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", normalizedProductId),
      )
      .unique();

    if (!product) {
      throw new Error("Product not found.");
    }

    return await getHookLabPromptBlueprints(
      ctx,
      ownerId,
      normalizedProductId,
    );
  },
});
