import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/getSitemapEntries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await getSitemapEntries();
}
