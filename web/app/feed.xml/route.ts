import { getPublishedBlogPosts } from "@/lib/content/queries";
import { createRssXml } from "@/lib/content/seo";

export const dynamic = "force-static";

export function GET() {
  return new Response(createRssXml(getPublishedBlogPosts()), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
