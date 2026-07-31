import { z } from "zod";

const articleSchema = z
  .object({
    id: z.string().trim().optional(),
    title: z.string().trim().min(1),
    seo_title: z.string().trim().optional(),
    slug: z.string().trim().optional(),
    meta_description: z.string().trim().optional(),
    content_format: z.string().trim().optional(),
    content_markdown: z.string().optional(),
    content_mdx: z.string().optional(),
    content_html: z.string().optional(),
    image_url: z.string().trim().optional(),
    tags: z.array(z.string()).optional(),
    source: z.string().trim().optional(),
    created_at: z.string().trim().optional(),
    updated_at: z.string().trim().optional(),
  })
  .passthrough();

const publishArticlesSchema = z.object({
  event_type: z.literal("publish_articles"),
  timestamp: z.string().trim().optional(),
  data: z.object({
    articles: z.array(articleSchema).min(1),
  }),
});

const updateArticleSchema = z.object({
  event_type: z.literal("update_article"),
  timestamp: z.string().trim().optional(),
  data: z.object({
    article: articleSchema,
  }),
});

export const blogPublishPayloadSchema = z.discriminatedUnion("event_type", [
  publishArticlesSchema,
  updateArticleSchema,
]);

export type BlogPublishPayload = z.infer<typeof blogPublishPayloadSchema>;
export type BlogPublishArticle = z.infer<typeof articleSchema>;
