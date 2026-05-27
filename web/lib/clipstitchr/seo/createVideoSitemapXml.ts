import { createPublicVideoExampleUrl } from "@/lib/clipstitchr/example-outputs/createPublicVideoExampleUrl";
import { escapeXml } from "@/lib/clipstitchr/seo/escapeXml";
import type { PublicVideoExample } from "@/lib/clipstitchr/types/PublicVideoExample";
import { createCanonicalUrl } from "@/lib/site";

export function createVideoSitemapXml(examples: PublicVideoExample[]) {
  const entries = examples
    .map((example) =>
      [
        "<url>",
        `<loc>${escapeXml(createPublicVideoExampleUrl(example))}</loc>`,
        "<video:video>",
        `<video:thumbnail_loc>${escapeXml(createCanonicalUrl(example.thumbnailSrc))}</video:thumbnail_loc>`,
        `<video:title>${escapeXml(example.title)}</video:title>`,
        `<video:description>${escapeXml(example.description)}</video:description>`,
        `<video:content_loc>${escapeXml(createCanonicalUrl(example.videoSrc))}</video:content_loc>`,
        `<video:duration>${Math.max(1, Math.round(example.durationSeconds))}</video:duration>`,
        `<video:publication_date>${escapeXml(example.uploadDate)}</video:publication_date>`,
        `<video:family_friendly>yes</video:family_friendly>`,
        "</video:video>",
        "</url>",
      ].join(""),
    )
    .join("");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">',
    entries,
    "</urlset>",
  ].join("");
}
