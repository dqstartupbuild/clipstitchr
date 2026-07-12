import type { MutationCtx } from "../_generated/server";

export async function linkHookOptionToIdea({
  ctx,
  ideaId,
  optionId,
  ownerId,
  updatedAt,
}: {
  ctx: MutationCtx;
  ideaId: string;
  optionId?: string;
  ownerId: string;
  updatedAt: string;
}) {
  if (!optionId) {
    return;
  }

  const option = await ctx.db
    .query("stitchrHookOptions")
    .withIndex("by_owner_id", (index) =>
      index.eq("ownerId", ownerId).eq("id", optionId),
    )
    .unique();

  if (option) {
    await ctx.db.patch(option._id, {
      linkedIdeaId: ideaId,
      reviewState: "saved",
      reviewedAt: updatedAt,
      updatedAt,
    });
  }
}
