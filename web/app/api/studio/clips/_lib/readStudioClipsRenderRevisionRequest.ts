import { z } from "zod";
import type { StudioClipsRenderRevisionRequest } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderRevisionRequest";
import { readStudioClipsJsonObject } from "./readStudioClipsJsonObject";

const identifier = z.string().min(1).max(160).regex(/^[A-Za-z0-9:_-]+$/u);
const captionStyle = z.object({
  customFontObjectKey: z.string().min(1).max(1_024).optional(),
  fontColorHex: z.string().regex(/^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/u).optional(),
  fontFamily: z.string().min(1).max(100).optional(),
  fontSizePx: z.number().int().min(8).max(200).optional(),
  templateId: z.string().min(1).max(50),
}).strict();
const operation = z.discriminatedUnion("kind", [
  z.object({ endSeconds: z.number().positive().max(5_400), kind: z.literal("trim"), startSeconds: z.number().nonnegative().max(5_400) }).strict(),
  z.object({ kind: z.literal("split"), pointsSeconds: z.array(z.number().positive().max(5_400)).min(1).max(100) }).strict(),
  z.object({ kind: z.literal("merge"), outputIds: z.array(identifier).min(2).max(20) }).strict(),
  z.object({
    burnIn: z.boolean(),
    enabled: z.boolean(),
    kind: z.literal("captions"),
    languageCode: z.string().min(1).max(20).optional(),
    style: captionStyle.optional(),
    styleSnapshotJson: z.string().max(32 * 1_024).optional(),
  }).strict(),
  z.object({ instructions: z.string().min(1).max(2_000).optional(), kind: z.literal("regenerate") }).strict(),
  z.object({ kind: z.literal("platform_export"), preset: z.enum(["instagram_reels", "tiktok", "youtube_shorts"]) }).strict(),
]);
const requestSchema = z.object({
  idempotencyKey: z.string().min(1).max(200),
  operation,
  productId: identifier,
  schemaVersion: z.literal("studio-clips-render-revision-request-v1"),
  sourceOutputId: identifier,
  sourceOutputRevision: z.number().int().positive(),
  taskId: identifier,
}).strict();

export async function readStudioClipsRenderRevisionRequest(
  request: Request,
): Promise<StudioClipsRenderRevisionRequest> {
  return requestSchema.parse(
    await readStudioClipsJsonObject(request, 128 * 1_024),
  ) as StudioClipsRenderRevisionRequest;
}
