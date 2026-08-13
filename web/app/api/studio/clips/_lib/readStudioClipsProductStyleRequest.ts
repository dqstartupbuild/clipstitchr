import { z } from "zod";
import type { StudioClipsProductStyleRequest } from "@/lib/clipstitchr/types/studioClips/StudioClipsProductStyleRequest";
import { readStudioClipsJsonObject } from "./readStudioClipsJsonObject";

const requestSchema = z.object({
  idempotencyKey: z.string().min(1).max(200),
  productId: z.string().min(1).max(160).regex(/^[A-Za-z0-9:_-]+$/u),
  schemaVersion: z.literal("studio-clips-product-style-request-v1"),
  style: z.object({
    customFontObjectKey: z.string().min(1).max(1_024).optional(),
    fontColorHex: z.string().regex(/^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/u).optional(),
    fontFamily: z.string().min(1).max(100).optional(),
    fontSizePx: z.number().int().min(8).max(200).optional(),
    templateId: z.string().min(1).max(50),
  }).strict(),
}).strict();

export async function readStudioClipsProductStyleRequest(
  request: Request,
): Promise<StudioClipsProductStyleRequest> {
  return requestSchema.parse(
    await readStudioClipsJsonObject(request, 16 * 1_024),
  ) as StudioClipsProductStyleRequest;
}
