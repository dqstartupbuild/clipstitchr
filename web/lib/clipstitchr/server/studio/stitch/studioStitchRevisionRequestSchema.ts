import { z } from "zod";

export const studioStitchRevisionRequestSchema = z.strictObject({
  productId: z.string().trim().min(1).max(120),
  expectedRevision: z.number().int().positive(),
  idempotencyKey: z.string().trim().min(1).max(200),
});
