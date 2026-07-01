import { getPublishedBlogPosts } from "@/lib/content/queries";
import { fetchConvexBlogPostCards } from "@/lib/content/runtimeBlog/fetchConvexBlogPostCards";
import { toRssPostFromConvexBlogPostCard } from "@/lib/content/runtimeBlog/toRssPostFromConvexBlogPostCard";
import type { RssPost } from "./RssPost";
import { sortRssPostsByDateDescending } from "./sortRssPostsByDateDescending";

export async function getRssBlogPosts(): Promise<RssPost[]> {
  const mdxPosts = getPublishedBlogPosts();
  const mdxSlugs = new Set(mdxPosts.map((post) => post.slug));
  const convexPosts = await fetchConvexBlogPostCards();
  const runtimePosts: RssPost[] = convexPosts
    .filter((post) => !mdxSlugs.has(post.slug))
    .map(toRssPostFromConvexBlogPostCard);

  return sortRssPostsByDateDescending([...mdxPosts, ...runtimePosts]);
}
