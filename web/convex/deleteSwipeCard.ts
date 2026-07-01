import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function deleteSwipeCard(
  ctx: MutationCtx,
  swipe: Pick<Doc<"swipes">, "id" | "ownerId">,
) {
  const existingCard = await ctx.db
    .query("swipeCards")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", swipe.ownerId).eq("id", swipe.id),
    )
    .unique();

  if (existingCard) {
    await ctx.db.delete(existingCard._id);
  }
}
