import { getPublicVideoExamples } from "@/lib/clipstitchr/example-outputs/getPublicVideoExamples";
import { createVideoSitemapXml } from "@/lib/clipstitchr/seo/createVideoSitemapXml";

export const dynamic = "force-static";

export function GET() {
  return new Response(createVideoSitemapXml(getPublicVideoExamples()), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
