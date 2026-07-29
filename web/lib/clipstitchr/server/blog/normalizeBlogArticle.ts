import type { BlogPublishArticle } from "./blogPublishPayloadSchema";
import { slugifyBlogTitle } from "./slugifyBlogTitle";

export type NormalizedBlogArticle = {
  slug: string;
  externalId?: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  contentFormat: "mdx" | "markdown" | "html";
  content: string;
  contentHtml?: string;
  imageUrl?: string;
  tags: string[];
  source?: string;
  createdAt?: string;
  updatedAt?: string;
};

const tagLimit = 24;
const tagMaxLength = 60;

function normalizeTags(tags: string[] | undefined) {
  if (!tags?.length) {
    return [];
  }

  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim().slice(0, tagMaxLength))
        .filter((tag) => tag.length > 0),
    ),
  ).slice(0, tagLimit);
}

function resolveSlug(article: BlogPublishArticle) {
  const provided = article.slug?.trim();
  const slug = provided ? slugifyBlogTitle(provided) : "";

  if (slug) {
    return slug;
  }

  return slugifyBlogTitle(article.title);
}

function resolveImageUrl(imageUrl: string | undefined) {
  const trimmed = imageUrl?.trim();

  if (!trimmed) {
    return undefined;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error("Blog image URLs must use http or https.");
  }

  return trimmed;
}

export function normalizeBlogArticle(
  article: BlogPublishArticle,
): NormalizedBlogArticle {
  const slug = resolveSlug(article);

  if (!slug) {
    throw new Error("Unable to derive a blog slug from the article.");
  }

  const mdx = article.content_mdx?.trim();
  const markdown = article.content_markdown?.trim();
  const html = article.content_html?.trim();

  let contentFormat: NormalizedBlogArticle["contentFormat"];
  let content: string;

  if (mdx) {
    contentFormat = "mdx";
    content = mdx;
  } else if (markdown) {
    contentFormat = "markdown";
    content = markdown;
  } else if (html) {
    contentFormat = "html";
    content = html;
  } else {
    throw new Error("The article is missing publishable content.");
  }

  const metaDescription = article.meta_description?.trim() ?? "";

  return {
    slug,
    externalId: article.id?.trim() || undefined,
    title: article.title.trim(),
    seoTitle: article.seo_title?.trim() || article.title.trim(),
    metaDescription,
    contentFormat,
    content,
    contentHtml: contentFormat === "html" ? html || undefined : undefined,
    imageUrl: resolveImageUrl(article.image_url),
    tags: normalizeTags(article.tags),
    source: article.source?.trim() || undefined,
    createdAt: article.created_at?.trim() || undefined,
    updatedAt: article.updated_at?.trim() || undefined,
  };
}
