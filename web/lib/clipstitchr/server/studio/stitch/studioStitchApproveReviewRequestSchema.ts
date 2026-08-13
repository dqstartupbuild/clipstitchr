import { z } from "zod";

export const studioStitchApproveReviewRequestSchema = z.strictObject({
  productId: z.string().trim().min(1).max(120),
  approvedOutputIds: z.array(z.string().trim().min(1).max(120)).min(1).max(100),
  expectedRevision: z.number().int().positive(),
  idempotencyKey: z.string().trim().min(1).max(200),
});
