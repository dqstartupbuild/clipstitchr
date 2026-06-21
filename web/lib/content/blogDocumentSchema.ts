import { z } from "zod";
import { baseContentDocumentSchema } from "./baseContentDocumentSchema";

export const blogDocumentSchema = baseContentDocumentSchema.extend({
  excerpt: z.string().trim().min(1).optional(),
  featured: z.boolean().default(false),
});
