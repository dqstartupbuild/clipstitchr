import { getPublishedBlogPosts } from "@/lib/content/queries";
import { fetchConvexBlogPosts } from "@/lib/content/runtimeBlog/fetchConvexBlogPosts";
import { toRuntimeBlogPostFromConvex } from "@/lib/content/runtimeBlog/toRuntimeBlogPostFromConvex";
import type { RssPost } from "./RssPost";
import { sortRssPostsByDateDescending } from "./sortRssPostsByDateDescending";

export async function getRssBlogPosts(): Promise<RssPost[]> {
  const mdxPosts = getPublishedBlogPosts();
  const mdxSlugs = new Set(mdxPosts.map((post) => post.slug));
  const convexPosts = await fetchConvexBlogPosts();
  const runtimePosts: RssPost[] = convexPosts
    .filter((post) => !mdxSlugs.has(post.slug))
    .map(toRuntimeBlogPostFromConvex);

  return sortRssPostsByDateDescending([...mdxPosts, ...runtimePosts]);
}
