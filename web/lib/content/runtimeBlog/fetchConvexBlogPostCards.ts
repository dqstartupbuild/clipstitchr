import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import type { ConvexBlogPostCard } from "./ConvexBlogPostCard";

export async function fetchConvexBlogPostCards(): Promise<
  ConvexBlogPostCard[]
> {
  try {
    const convex = createConvexHttpClient();

    return await convex.query(api.blogPosts.listPublishedBlogPostCards, {});
  } catch {
    return [];
  }
}
