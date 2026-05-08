import type { R2ObjectKind } from "@/lib/clipstitchr/types/R2ObjectKind";

const R2_OBJECT_KINDS = new Set<R2ObjectKind>([
  "video-clip-video",
  "video-clip-poster",
  "photo",
  "photo-original",
  "photo-thumbnail",
  "stitch-video",
  "stitch-poster",
]);

type R2UploadUrlRequest = {
  kind: R2ObjectKind;
  recordId: string;
  contentType: string;
};

export async function readR2UploadUrlRequest(
  request: Request,
): Promise<R2UploadUrlRequest> {
  const body = (await request.json()) as Partial<R2UploadUrlRequest>;

  if (!body.kind || !R2_OBJECT_KINDS.has(body.kind)) {
    throw new Error("Invalid R2 object kind.");
  }

  if (!body.recordId || typeof body.recordId !== "string") {
    throw new Error("Missing R2 record ID.");
  }

  if (!body.contentType || typeof body.contentType !== "string") {
    throw new Error("Missing R2 content type.");
  }

  return {
    kind: body.kind,
    recordId: body.recordId,
    contentType: body.contentType,
  };
}
