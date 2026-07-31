import type { MutationCtx } from "../_generated/server";
import { getBlogPostCardFields } from "./getBlogPostCardFields";

export async function upsertBlogPostCardBySlug(
  ctx: MutationCtx,
  post: Parameters<typeof getBlogPostCardFields>[0],
) {
  const [existingCard, ...duplicateCards] = await ctx.db
    .query("blogPostCards")
    .withIndex("by_slug", (q) => q.eq("slug", post.slug))
    .collect();
  const cardFields = getBlogPostCardFields(post);

  for (const duplicateCard of duplicateCards) {
    await ctx.db.delete(duplicateCard._id);
  }

  if (existingCard) {
    await ctx.db.patch(existingCard._id, cardFields);
    return existingCard._id;
  }

  return await ctx.db.insert("blogPostCards", cardFields);
}
