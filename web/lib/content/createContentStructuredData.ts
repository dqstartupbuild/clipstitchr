import { createBreadcrumbJsonLd } from "@/lib/clipstitchr/seo/createBreadcrumbJsonLd";
import { isBlogPost } from "./isBlogPost";
import { hasContentSchemaTypeHint } from "./hasContentSchemaTypeHint";
import { createArticleJsonLd, createFaqJsonLd } from "./seo";
import type { Blog, CaseStudy } from "content-collections";

type ContentArticle = Blog | CaseStudy;

export function createContentStructuredData(post: ContentArticle) {
  const isBlog = isBlogPost(post);
  const collection = isBlog ? "Blog" : "Case studies";
  const collectionPathname = isBlog ? "/blog" : "/case-studies";
  const faq = hasContentSchemaTypeHint(post, "faq")
    ? createFaqJsonLd(post)
    : null;
  const article = hasContentSchemaTypeHint(post, "article")
    ? createArticleJsonLd(post)
    : null;

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...(article ? [article] : []),
      createBreadcrumbJsonLd([
        { name: "Home", pathname: "/" },
        { name: collection, pathname: collectionPathname },
        { name: post.title, pathname: new URL(post.canonical).pathname },
      ]),
      ...(faq ? [faq] : []),
    ],
  };
}
