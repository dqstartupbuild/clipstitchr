import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import type { BlogPostUpsertArgs } from "./BlogPostUpsertArgs";

type BlogPostIdentity = Pick<BlogPostUpsertArgs, "externalId" | "slug">;

export async function findBlogPostUpsertMatches(
  ctx: MutationCtx,
  identity: BlogPostIdentity,
) {
  const externalIdMatches = identity.externalId
    ? await ctx.db
        .query("blogPosts")
        .withIndex("by_external_id", (query) =>
          query.eq("externalId", identity.externalId),
        )
        .collect()
    : [];
  const slugMatches = await ctx.db
    .query("blogPosts")
    .withIndex("by_slug", (query) => query.eq("slug", identity.slug))
    .collect();
  const canonicalPost = externalIdMatches[0] ?? slugMatches[0] ?? null;
  const matchingPosts = new Map<string, Doc<"blogPosts">>();

  for (const post of [...externalIdMatches, ...slugMatches]) {
    matchingPosts.set(post._id, post);
  }

  if (canonicalPost) {
    matchingPosts.delete(canonicalPost._id);
  }

  return {
    canonicalPost,
    duplicatePosts: Array.from(matchingPosts.values()),
  };
}
