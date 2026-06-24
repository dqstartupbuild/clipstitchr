import type { Metadata } from "next";
import { type Blog, type CaseStudy } from "content-collections";
import { createPageMetadata } from "@/lib/metadata";
import { createCanonicalUrl, site } from "@/lib/site";
import type { RssPost } from "./RssPost";

type ContentArticle = Blog | CaseStudy;

function toAbsoluteImageUrl(image: string) {
  return image.startsWith("http") ? image : createCanonicalUrl(image);
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function createContentMetadata(post: ContentArticle): Metadata {
  const metadata = createPageMetadata({
    title: post.seoTitle,
    description: post.description,
    canonical: post.canonical,
    keywords: [post.targetKeyword, ...post.tags],
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: toAbsoluteImageUrl(post.image),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      ...metadata.twitter,
      images: [toAbsoluteImageUrl(post.image)],
    },
  };
}

export function createArticleJsonLd(post: ContentArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: site.publisherName,
      url: site.url,
    },
    image: [toAbsoluteImageUrl(post.image)],
    mainEntityOfPage: post.canonical,
    keywords: [post.targetKeyword, ...post.tags].join(", "),
    articleSection: post.category,
  };
}

export function createFaqJsonLd(post: ContentArticle) {
  if (!post.faq?.length) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

export function createRssXml(posts: RssPost[]) {
  const items = posts
    .map((post) => {
      const title = post.seoTitle ?? post.title;

      return [
        "<item>",
        `<title>${escapeXml(title)}</title>`,
        `<link>${escapeXml(post.canonical)}</link>`,
        `<guid>${escapeXml(post.canonical)}</guid>`,
        `<pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
        `<description>${escapeXml(post.description)}</description>`,
        "</item>",
      ].join("");
    })
    .join("");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "<channel>",
    `<title>${escapeXml(site.name)}</title>`,
    `<link>${escapeXml(site.url)}</link>`,
    `<description>${escapeXml(site.defaultDescription)}</description>`,
    items,
    "</channel>",
    "</rss>",
  ].join("");
}
