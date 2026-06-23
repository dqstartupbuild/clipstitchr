export type RuntimeBlogPostSource = "mdx" | "convex";

export type RuntimeBlogPost = {
  slug: string;
  url: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  date: string;
  updated?: string;
  image?: string;
  readingTimeMinutes: number;
  bodyHtml: string;
  canonical: string;
  source: RuntimeBlogPostSource;
};
