import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { mutation, query } from "./_generated/server";
import { upsertBlogPostCardBySlug } from "./blogPostCards/upsertBlogPostCardBySlug";
import { upsertBlogPost } from "./blogPosts/upsertBlogPost";
import { blogPostContentFormatValidator } from "./validators/blogPostContentFormat";

const BLOG_POST_CARD_LIST_LIMIT = 100;
const BLOG_POST_CARD_REBUILD_LIMIT = 500;

const upsertArgs = {
  secret: v.string(),
  slug: v.string(),
  externalId: v.optional(v.string()),
  title: v.string(),
  seoTitle: v.optional(v.string()),
  metaDescription: v.string(),
  contentFormat: blogPostContentFormatValidator,
  content: v.string(),
  contentHtml: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  tags: v.array(v.string()),
  source: v.optional(v.string()),
  createdAt: v.optional(v.string()),
  updatedAt: v.optional(v.string()),
};

export const upsertPublishedArticle = mutation({
  args: upsertArgs,
  handler: async (ctx, { secret, ...args }) => {
    assertRateLimitApiSecret(secret);

    return upsertBlogPost(ctx, args);
  },
});

export const listPublishedBlogPostCards = query({
  args: {},
  handler: async (ctx) => {
    const cards = await ctx.db
      .query("blogPostCards")
      .withIndex("by_published")
      .order("desc")
      .take(BLOG_POST_CARD_LIST_LIMIT);

    return cards.map((card) => ({
      slug: card.slug,
      title: card.title,
      seoTitle: card.seoTitle ?? card.title,
      metaDescription: card.metaDescription,
      imageUrl: card.imageUrl,
      tags: card.tags,
      source: card.source,
      readingTimeMinutes: card.readingTimeMinutes,
      publishedAt: card.publishedAt,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    }));
  },
});

export const rebuildPublishedBlogPostCards = mutation({
  args: {
    paginationOpts: v.optional(paginationOptsValidator),
    secret: v.string(),
  },
  handler: async (ctx, { paginationOpts, secret }) => {
    assertRateLimitApiSecret(secret);

    if (paginationOpts) {
      const page = await ctx.db
        .query("blogPosts")
        .withIndex("by_published")
        .paginate(paginationOpts);

      for (const post of page.page) {
        await upsertBlogPostCardBySlug(ctx, post);
      }

      return {
        continueCursor: page.continueCursor,
        count: page.page.length,
        isDone: page.isDone,
      };
    }

    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_published")
      .take(BLOG_POST_CARD_REBUILD_LIMIT);

    for (const post of posts) {
      await upsertBlogPostCardBySlug(ctx, post);
    }

    return { count: posts.length };
  },
});

export const getPublishedBlogPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (!post) {
      return null;
    }

    return {
      slug: post.slug,
      title: post.title,
      seoTitle: post.seoTitle ?? post.title,
      metaDescription: post.metaDescription,
      contentFormat: post.contentFormat,
      content: post.content,
      contentHtml: post.contentHtml,
      imageUrl: post.imageUrl,
      tags: post.tags,
      source: post.source,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  },
});
