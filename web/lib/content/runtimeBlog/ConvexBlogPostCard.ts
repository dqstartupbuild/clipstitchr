export type ConvexBlogPostCard = {
  slug: string;
  title: string;
  seoTitle?: string;
  metaDescription: string;
  imageUrl?: string;
  tags: string[];
  source?: string;
  readingTimeMinutes: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};
