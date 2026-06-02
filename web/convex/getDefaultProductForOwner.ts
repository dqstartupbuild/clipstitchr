import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function getDefaultProductForOwner(
  ctx: MutationCtx,
  ownerId: string,
): Promise<Doc<"products"> | null> {
  const preferences = await ctx.db
    .query("productPreferences")
    .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
    .unique();

  if (!preferences?.defaultProductId) {
    return null;
  }

  const defaultProductId = preferences.defaultProductId;

  return await ctx.db
    .query("products")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", ownerId).eq("id", defaultProductId),
    )
    .unique();
}
