import { getRssBlogPosts } from "@/lib/content/getRssBlogPosts";
import { createRssXml } from "@/lib/content/seo";

export const revalidate = 3600;

export async function GET() {
  return new Response(createRssXml(await getRssBlogPosts()), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
