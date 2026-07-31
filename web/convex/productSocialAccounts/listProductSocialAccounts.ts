import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertProductBelongsToOwner } from "../assertProductBelongsToOwner";

export const listProductSocialAccounts = query({
  args: {
    productId: v.string(),
  },
  handler: async (ctx, { productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await assertProductBelongsToOwner(ctx, ownerId, productId);

    return await ctx.db
      .query("productSocialAccounts")
      .withIndex("by_owner_product", (index) =>
        index.eq("ownerId", ownerId).eq("productId", productId),
      )
      .collect();
  },
});
