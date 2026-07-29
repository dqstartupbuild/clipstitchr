import type { MutationCtx } from "../_generated/server";
import { deleteBlogPostCardsBySlug } from "../blogPostCards/deleteBlogPostCardsBySlug";
import { upsertBlogPostCardBySlug } from "../blogPostCards/upsertBlogPostCardBySlug";
import type { BlogPostUpsertArgs } from "./BlogPostUpsertArgs";
import { deleteDuplicateBlogPosts } from "./deleteDuplicateBlogPosts";
import { findBlogPostUpsertMatches } from "./findBlogPostUpsertMatches";
import { getReplacedBlogPostSlugs } from "./getReplacedBlogPostSlugs";

export async function upsertBlogPost(
  ctx: MutationCtx,
  args: BlogPostUpsertArgs,
) {
  const now = new Date().toISOString();
  const { canonicalPost, duplicatePosts } =
    await findBlogPostUpsertMatches(ctx, args);
  const replacedSlugs = getReplacedBlogPostSlugs(
    args.slug,
    canonicalPost,
    duplicatePosts,
  );
  const fields = {
    slug: args.slug,
    externalId: args.externalId,
    title: args.title,
    seoTitle: args.seoTitle ?? args.title,
    metaDescription: args.metaDescription,
    contentFormat: args.contentFormat,
    content: args.content,
    contentHtml: args.contentHtml,
    imageUrl: args.imageUrl,
    tags: args.tags,
    source: args.source,
  };

  await deleteDuplicateBlogPosts(ctx, duplicatePosts);

  if (canonicalPost) {
    const patchFields = {
      ...fields,
      publishedAt: canonicalPost.publishedAt,
      createdAt: canonicalPost.createdAt,
      updatedAt: args.updatedAt ?? now,
    };
    const patchedPost = {
      ...canonicalPost,
      ...patchFields,
    };

    await ctx.db.patch(canonicalPost._id, patchFields);

    if (canonicalPost.slug !== args.slug) {
      await deleteBlogPostCardsBySlug(ctx, canonicalPost.slug);
    }

    await upsertBlogPostCardBySlug(ctx, patchedPost);

    return {
      slug: args.slug,
      replacedSlugs,
      status: "updated" as const,
    };
  }

  const post = {
    ...fields,
    publishedAt: now,
    createdAt: args.createdAt ?? now,
    updatedAt: args.updatedAt ?? now,
  };

  await ctx.db.insert("blogPosts", post);
  await upsertBlogPostCardBySlug(ctx, post);

  return {
    slug: args.slug,
    replacedSlugs,
    status: "created" as const,
  };
}
