import { estimateBlogPostReadingTimeMinutes } from "./estimateBlogPostReadingTimeMinutes";

type BlogPostCardFieldSource = {
  slug: string;
  title: string;
  metaDescription: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  source?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export function getBlogPostCardFields(post: BlogPostCardFieldSource) {
  return {
    slug: post.slug,
    title: post.title,
    metaDescription: post.metaDescription,
    imageUrl: post.imageUrl,
    tags: post.tags,
    source: post.source,
    readingTimeMinutes: estimateBlogPostReadingTimeMinutes(post.content),
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}
