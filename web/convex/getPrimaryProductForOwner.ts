import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export async function getPrimaryProductForOwner(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
): Promise<Doc<"products"> | null> {
  const preferences = await ctx.db
    .query("productPreferences")
    .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
    .unique();

  if (preferences?.defaultProductId) {
    const preferredProduct = await ctx.db
      .query("products")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", preferences.defaultProductId ?? ""),
      )
      .unique();

    if (preferredProduct) {
      return preferredProduct;
    }
  }

  return await ctx.db
    .query("products")
    .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
    .order("asc")
    .first();
}
