import type { MutationCtx, QueryCtx } from "./_generated/server";

export async function getAutomationPreferenceForProduct(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  productId?: string,
) {
  if (productId) {
    const productPreference = await ctx.db
      .query("automationPreferences")
      .withIndex("by_owner_product", (q) =>
        q.eq("ownerId", ownerId).eq("productId", productId),
      )
      .unique();

    if (productPreference) {
      return productPreference;
    }
  }

  return await ctx.db
    .query("automationPreferences")
    .withIndex("by_owner_product", (q) =>
      q.eq("ownerId", ownerId).eq("productId", undefined),
    )
    .unique();
}
