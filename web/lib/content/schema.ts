import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slugs must be lowercase and hyphenated.",
  });

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Dates must use YYYY-MM-DD format.",
});

const absoluteUrlSchema = z
  .url()
  .refine((value) => /^https?:\/\//.test(value), {
    message: "URLs must be absolute http(s) URLs.",
  });

const faqEntrySchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

const baseDocumentSchema = z.object({
  title: z.string().trim().min(1),
  seoTitle: z.string().trim().min(50).max(70),
  slug: slugSchema,
  description: z.string().trim().min(110).max(170),
  date: dateSchema,
  updated: dateSchema.optional(),
  draft: z.boolean().default(false),
  author: z.string().trim().min(1),
  category: z.string().trim().min(1),
  tags: z.array(z.string().trim().min(1)).min(1),
  image: z.string().trim().startsWith("/"),
  canonical: absoluteUrlSchema,
  targetKeyword: z.string().trim().min(1),
  intent: z.enum([
    "informational",
    "commercial",
    "comparison",
    "transactional",
  ]),
  ctaVariant: z.enum(["survey", "primary", "validation"]).default("survey"),
  faq: z.array(faqEntrySchema).optional(),
  relatedSlugs: z.array(slugSchema).default([]),
  schemaTypeHints: z
    .array(z.enum(["article", "faq", "comparison"]))
    .min(1)
    .default(["article"]),
  content: z.string().trim().min(1),
});

export const blogDocumentSchema = baseDocumentSchema.extend({
  excerpt: z.string().trim().min(1).optional(),
  featured: z.boolean().default(false),
});

export type BlogDocumentInput = z.infer<typeof blogDocumentSchema>;
