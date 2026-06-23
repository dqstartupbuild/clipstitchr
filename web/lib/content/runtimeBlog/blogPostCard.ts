export type BlogPostCard = {
  slug: string;
  url: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string;
  updated?: string;
  readingTimeMinutes: number;
  featured: boolean;
};
