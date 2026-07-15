import { createPublicVideoExampleUrl } from "@/lib/clipstitchr/example-outputs/createPublicVideoExampleUrl";
import { formatIso8601Duration } from "@/lib/clipstitchr/seo/formatIso8601Duration";
import type { PublicVideoExample } from "@/lib/clipstitchr/types/PublicVideoExample";
import { brandAssets } from "@/lib/brandAssets";
import { createCanonicalUrl, site } from "@/lib/site";

export function createVideoObjectJsonLd(example: PublicVideoExample) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: example.title,
    description: example.description,
    thumbnailUrl: createCanonicalUrl(example.thumbnailSrc),
    uploadDate: example.uploadDate,
    duration: formatIso8601Duration(example.durationSeconds),
    contentUrl: createCanonicalUrl(example.videoSrc),
    url: createPublicVideoExampleUrl(example),
    publisher: {
      "@type": "Organization",
      name: site.publisherName,
      url: site.url,
      logo: {
        "@type": "ImageObject",
        url: createCanonicalUrl(brandAssets.icon512),
      },
    },
    keywords: example.tags.join(", "),
  };
}
