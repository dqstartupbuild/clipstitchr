import { z } from "zod";

export const studioStitchRemainingRequestSchema = z.strictObject({
  productId: z.string().trim().min(1).max(120),
  remainingRunId: z.string().trim().min(1).max(120),
  idempotencyKey: z.string().trim().min(1).max(200),
});
