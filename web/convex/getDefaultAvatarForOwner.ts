import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function getDefaultAvatarForOwner(
  ctx: MutationCtx,
  ownerId: string,
): Promise<Doc<"avatars"> | null> {
  const preferences = await ctx.db
    .query("avatarPreferences")
    .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
    .unique();

  if (!preferences?.defaultAvatarId) {
    return null;
  }

  const defaultAvatarId = preferences.defaultAvatarId;

  return await ctx.db
    .query("avatars")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", ownerId).eq("id", defaultAvatarId),
    )
    .unique();
}
