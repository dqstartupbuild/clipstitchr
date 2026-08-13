import { z } from "zod";

export const studioStitchRunRequestSchema = z.strictObject({
  runId: z.string().trim().min(1).max(120),
  reviewSubsetId: z.string().trim().min(1).max(120),
  productId: z.string().trim().min(1).max(120),
  recipeIds: z.array(z.string().trim().min(1).max(120)).min(1).max(100),
  reviewCount: z.number().int().min(1).max(100),
  idempotencyKey: z.string().trim().min(1).max(200),
});
