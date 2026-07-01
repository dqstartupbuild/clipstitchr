import { getPublishedBlogPosts } from "@/lib/content/queries";
import type { BlogPostCard } from "./blogPostCard";
import { fetchConvexBlogPostCards } from "./fetchConvexBlogPostCards";
import { toBlogPostCardFromConvexBlogPostCard } from "./toBlogPostCardFromConvexBlogPostCard";

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

  const convexPosts = await fetchConvexBlogPostCards();
  const mdxSlugs = new Set(mdxCards.map((card) => card.slug));

  const convexCards: BlogPostCard[] = convexPosts
    .filter((post) => !mdxSlugs.has(post.slug))
    .map(toBlogPostCardFromConvexBlogPostCard);

  return sortCardsByDateDescending([...mdxCards, ...convexCards]);
}
