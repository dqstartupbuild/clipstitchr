export type BlogPostUpsertArgs = {
  slug: string;
  externalId?: string;
  title: string;
  seoTitle?: string;
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
