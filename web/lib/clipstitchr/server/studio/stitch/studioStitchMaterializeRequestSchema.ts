import { z } from "zod";

export const studioStitchMaterializeRequestSchema = z.strictObject({
  idempotencyKey: z.string().trim().min(1).max(200),
  productId: z.string().trim().min(1).max(120),
});
