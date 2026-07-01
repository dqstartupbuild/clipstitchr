import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function deleteSwiprBackgroundCard(
  ctx: MutationCtx,
  background: Pick<Doc<"swiprBackgrounds">, "id">,
) {
  const existingCard = await ctx.db
    .query("swiprBackgroundCards")
    .withIndex("by_background_id", (q) => q.eq("id", background.id))
    .unique();

  if (existingCard) {
    await ctx.db.delete(existingCard._id);
  }
}
