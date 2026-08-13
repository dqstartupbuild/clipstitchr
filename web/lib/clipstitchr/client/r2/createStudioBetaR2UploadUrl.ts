import { readR2JsonResponse } from "@/lib/clipstitchr/client/r2/readR2JsonResponse";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { StudioBetaR2ObjectKind } from "@/lib/clipstitchr/types/StudioBetaR2ObjectKind";

type CreateStudioBetaR2UploadUrlOptions = {
  blob: Blob;
  kind: StudioBetaR2ObjectKind;
  productId: string;
  recordId: string;
};

export async function createStudioBetaR2UploadUrl({
  blob,
  kind,
  productId,
  recordId,
}: CreateStudioBetaR2UploadUrlOptions) {
  const contentType = blob.type || "application/octet-stream";
  const response = await fetch("/api/studio/r2/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType,
      kind,
      productId,
      recordId,
      sizeBytes: blob.size,
    }),
  });
  const signed = await readR2JsonResponse<{ key: string; url: string }>(
    response,
  );

  return {
    contentType,
    key: signed.key,
    size: blob.size,
    url: signed.url,
  } satisfies R2ObjectReference & { url: string };
}
