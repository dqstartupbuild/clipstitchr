import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function deleteStitchCard(
  ctx: MutationCtx,
  stitch: Pick<Doc<"stitches">, "id" | "ownerId">,
) {
  const existingCard = await ctx.db
    .query("stitchCards")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", stitch.ownerId).eq("id", stitch.id),
    )
    .unique();

  if (existingCard) {
    await ctx.db.delete(existingCard._id);
  }
}
