import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/docs",
          "/blog",
          "/examples",
          "/feed.xml",
          "/api/v1",
          "/api/tools/app-hook-generator",
        ],
        disallow: ["/api/", "/dashboard", "/_next/"],
      },
    ],
    sitemap: [`${site.url}/sitemap.xml`, `${site.url}/video-sitemap.xml`],
    host: site.url,
  };
}
