import type { MutationCtx } from "../_generated/server";

export async function disableProductAutomation(
  ctx: MutationCtx,
  ownerId: string,
  productId: string,
  now: string,
) {
  const automation = await ctx.db
    .query("automationPreferences")
    .withIndex("by_owner_product", (query) =>
      query.eq("ownerId", ownerId).eq("productId", productId),
    )
    .unique();

  if (!automation?.enabled) {
    return false;
  }

  await ctx.db.patch(automation._id, {
    enabled: false,
    preferenceVersion: automation.preferenceVersion + 1,
    updatedAt: now,
  });

  return true;
}
