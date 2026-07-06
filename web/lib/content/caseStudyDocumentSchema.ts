import { z } from "zod";
import { baseContentDocumentSchema } from "./baseContentDocumentSchema";
import { caseStudyToolSchema } from "./caseStudyToolSchema";

const caseStudyMetricSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

export const caseStudyDocumentSchema = baseContentDocumentSchema.extend({
  companyName: z.string().trim().min(1),
  productName: z.string().trim().min(1),
  metrics: z.array(caseStudyMetricSchema).min(1),
  tools: z.array(caseStudyToolSchema).min(1),
  excerpt: z.string().trim().min(1).optional(),
  featured: z.boolean().default(false),
});
