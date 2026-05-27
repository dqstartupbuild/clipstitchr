import type { Metadata } from "next";
import { createPublicVideoExamplePath } from "@/lib/clipstitchr/example-outputs/createPublicVideoExamplePath";
import type { PublicVideoExample } from "@/lib/clipstitchr/types/PublicVideoExample";
import { createPageMetadata } from "@/lib/metadata";
import { createCanonicalUrl, site } from "@/lib/site";

export function createPublicVideoExampleMetadata(
  example: PublicVideoExample,
): Metadata {
  const metadata = createPageMetadata({
    title: `${example.title} | ${site.name}`,
    description: example.description,
    canonical: createPublicVideoExamplePath(example),
    keywords: example.tags,
  });
  const thumbnailUrl = createCanonicalUrl(example.thumbnailSrc);

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      images: [
        {
          url: thumbnailUrl,
          width: example.width,
          height: example.height,
          alt: example.title,
        },
      ],
    },
    twitter: {
      ...metadata.twitter,
      images: [thumbnailUrl],
    },
  };
}
