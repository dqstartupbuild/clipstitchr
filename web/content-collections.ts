import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import remarkGfm from "remark-gfm";
import { blogDocumentSchema } from "./lib/content/blogDocumentSchema";
import { caseStudyDocumentSchema } from "./lib/content/caseStudyDocumentSchema";
import { createCanonicalUrl } from "./lib/site";

function estimateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const blog = defineCollection({
  name: "blog",
  directory: "content/blog",
  include: "**/*.mdx",
  schema: blogDocumentSchema,
  transform: async (document, context) => {
    const url = `/blog/${document.slug}`;
    const canonical = createCanonicalUrl(url);

    const body = await compileMDX(context, document, {
      remarkPlugins: [remarkGfm],
    });

    return {
      ...document,
      body,
      canonical,
      excerpt: document.excerpt ?? document.description,
      readingTimeMinutes: estimateReadingTime(document.content),
      url,
    };
  },
});

const caseStudy = defineCollection({
  name: "caseStudy",
  directory: "content/case-studies",
  include: "**/*.mdx",
  schema: caseStudyDocumentSchema,
  transform: async (document, context) => {
    const url = `/case-studies/${document.slug}`;
    const canonical = createCanonicalUrl(url);

    const body = await compileMDX(context, document, {
      remarkPlugins: [remarkGfm],
    });

    return {
      ...document,
      body,
      canonical,
      excerpt: document.excerpt ?? document.description,
      readingTimeMinutes: estimateReadingTime(document.content),
      url,
    };
  },
});

export default defineConfig({
  content: [blog, caseStudy],
});
