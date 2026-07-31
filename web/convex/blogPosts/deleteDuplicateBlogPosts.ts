import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { deleteBlogPostCardsBySlug } from "../blogPostCards/deleteBlogPostCardsBySlug";

export async function deleteDuplicateBlogPosts(
  ctx: MutationCtx,
  duplicatePosts: Doc<"blogPosts">[],
) {
  for (const duplicatePost of duplicatePosts) {
    await ctx.db.delete(duplicatePost._id);
    await deleteBlogPostCardsBySlug(ctx, duplicatePost.slug);
  }
}
