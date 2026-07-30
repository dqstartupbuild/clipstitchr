import type { MutationCtx } from "../_generated/server";

export async function detachSocialAccountDefaults(
  ctx: MutationCtx,
  ownerId: string,
  accountId: string,
) {
  const associations = await ctx.db
    .query("productSocialAccounts")
    .withIndex("by_owner_account", (index) =>
      index.eq("ownerId", ownerId).eq("socialAccountId", accountId),
    )
    .collect();

  for (const association of associations) {
    await ctx.db.delete(association._id);
  }

  return associations.length;
}
