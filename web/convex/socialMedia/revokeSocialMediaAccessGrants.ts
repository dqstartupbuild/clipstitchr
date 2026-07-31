import type { MutationCtx } from "../_generated/server";

export async function revokeSocialMediaAccessGrants(
  ctx: MutationCtx,
  ownerId: string,
  targetId: string,
  now: string,
) {
  const grants = await ctx.db
    .query("socialMediaAccessGrants")
    .withIndex("by_owner_target", (index) =>
      index.eq("ownerId", ownerId).eq("targetId", targetId),
    )
    .collect();

  for (const grant of grants) {
    if (!grant.revokedAt) {
      await ctx.db.patch(grant._id, { revokedAt: now });
    }
  }
}
