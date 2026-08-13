import { z } from "zod";

const optionalHandoffId = z.string().trim().min(1).max(240).nullable();

export const studioStitchAcceptOutputRequestSchema = z.strictObject({
  productId: z.string().trim().min(1).max(120),
  expectedRevision: z.number().int().positive(),
  idempotencyKey: z.string().trim().min(1).max(200),
  handoff: z.strictObject({
    libraryAssetId: optionalHandoffId,
    editorProjectId: optionalHandoffId,
    publishingSourceId: optionalHandoffId,
  }),
});
