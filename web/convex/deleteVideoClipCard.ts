import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function deleteVideoClipCard(
  ctx: MutationCtx,
  clip: Pick<Doc<"videoClips">, "id" | "ownerId">,
) {
  const existingCard = await ctx.db
    .query("videoClipCards")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", clip.ownerId).eq("id", clip.id),
    )
    .unique();

  if (existingCard) {
    await ctx.db.delete(existingCard._id);
  }
}
