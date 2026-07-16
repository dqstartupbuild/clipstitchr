import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";

export const listArchivedProducts = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const products = await ctx.db
      .query("products")
      .withIndex("by_owner_created", (query) => query.eq("ownerId", ownerId))
      .order("desc")
      .take(100);

    return products.filter((product) => Boolean(product.archivedAt));
  },
});
