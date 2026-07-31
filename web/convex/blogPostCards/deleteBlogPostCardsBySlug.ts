import type { MutationCtx } from "../_generated/server";

export async function deleteBlogPostCardsBySlug(
  ctx: MutationCtx,
  slug: string,
) {
  const cards = await ctx.db
    .query("blogPostCards")
    .withIndex("by_slug", (query) => query.eq("slug", slug))
    .collect();

  for (const card of cards) {
    await ctx.db.delete(card._id);
  }
}
