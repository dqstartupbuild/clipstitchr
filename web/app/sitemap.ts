import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/getSitemapEntries";

export default function sitemap(): MetadataRoute.Sitemap {
  return getSitemapEntries();
}
