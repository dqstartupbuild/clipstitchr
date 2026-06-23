import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import type { ConvexBlogPost } from "./toRuntimeBlogPostFromConvex";

export async function fetchConvexBlogPosts(): Promise<ConvexBlogPost[]> {
  try {
    const convex = createConvexHttpClient();

    return await convex.query(api.blogPosts.listPublishedBlogPosts, {});
  } catch {
    return [];
  }
}

export async function fetchConvexBlogPostBySlug(
  slug: string,
): Promise<ConvexBlogPost | null> {
  try {
    const convex = createConvexHttpClient();

    return await convex.query(api.blogPosts.getPublishedBlogPostBySlug, {
      slug,
    });
  } catch {
    return null;
  }
}
