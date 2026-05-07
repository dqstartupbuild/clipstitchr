import type { Metadata } from "next";
import { resolveOgImage } from "@/lib/og/server-resolver";
import { createCanonicalUrl, site } from "@/lib/site";

type CreatePageMetadataOptions = {
  title: string;
  description: string;
  canonical: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  canonical,
  keywords = [],
  noIndex = false,
}: CreatePageMetadataOptions): Metadata {
  const canonicalUrl = canonical.startsWith("http")
    ? canonical
    : createCanonicalUrl(canonical);
  const ogImage = resolveOgImage(canonicalUrl);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      siteName: site.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${site.name} open graph image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}
