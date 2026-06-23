import { getPublishedBlogPosts } from "@/lib/content/queries";
import type { BlogPostCard } from "./blogPostCard";
import { fetchConvexBlogPosts } from "./fetchConvexBlogPosts";
import { toRuntimeBlogPostFromConvex } from "./toRuntimeBlogPostFromConvex";

function sortCardsByDateDescending(cards: BlogPostCard[]) {
  return [...cards].sort(
    (left, right) =>
      new Date(right.updated ?? right.date).getTime() -
      new Date(left.updated ?? left.date).getTime(),
  );
}

export async function getBlogPostCards(): Promise<BlogPostCard[]> {
  const mdxCards: BlogPostCard[] = getPublishedBlogPosts().map((post) => ({
    slug: post.slug,
    url: post.url,
    title: post.title,
    description: post.description,
    category: post.category,
    tags: post.tags,
    date: post.date,
    updated: post.updated,
    readingTimeMinutes: post.readingTimeMinutes,
    featured: post.featured,
  }));

  const convexPosts = await fetchConvexBlogPosts();
  const mdxSlugs = new Set(mdxCards.map((card) => card.slug));

  const convexCards: BlogPostCard[] = convexPosts
    .filter((post) => !mdxSlugs.has(post.slug))
    .map((post) => {
      const runtimePost = toRuntimeBlogPostFromConvex(post);

      return {
        slug: runtimePost.slug,
        url: runtimePost.url,
        title: runtimePost.title,
        description: runtimePost.description,
        category: runtimePost.category,
        tags: runtimePost.tags,
        date: runtimePost.date,
        updated: runtimePost.updated,
        readingTimeMinutes: runtimePost.readingTimeMinutes,
        featured: false,
      };
    });

  return sortCardsByDateDescending([...mdxCards, ...convexCards]);
}
