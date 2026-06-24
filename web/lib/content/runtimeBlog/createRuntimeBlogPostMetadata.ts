import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import type { RuntimeBlogPost } from "./runtimeBlogPost";

export function createRuntimeBlogPostMetadata(
  runtimePost: RuntimeBlogPost,
): Metadata {
  const metadata = createPageMetadata({
    title: runtimePost.title,
    description: runtimePost.description,
    canonical: runtimePost.canonical,
    keywords: runtimePost.tags,
  });

  if (!runtimePost.image) {
    return metadata;
  }

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: runtimePost.date,
      modifiedTime: runtimePost.updated ?? runtimePost.date,
      authors: [runtimePost.author],
      tags: runtimePost.tags,
      images: [
        {
          url: runtimePost.image,
          width: 1200,
          height: 630,
          alt: runtimePost.title,
        },
      ],
    },
    twitter: {
      ...metadata.twitter,
      images: [runtimePost.image],
    },
  };
}
