import type { StudioClipsCreateRequest } from "@/lib/clipstitchr/types/studioClips/StudioClipsCreateRequest";
import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { readStudioClipsJsonObject } from "./readStudioClipsJsonObject";

export async function readStudioClipsCreateRequest(
  request: Request,
): Promise<StudioClipsCreateRequest> {
  const body = await readStudioClipsJsonObject(request, 32 * 1024);
  assertStudioClipsExactKeys(body, [
    "idempotencyKey",
    "options",
    "productId",
    "schemaVersion",
    "source",
  ]);
  if (
    body.schemaVersion !== "studio-clips-create-v1" ||
    typeof body.productId !== "string" ||
    typeof body.idempotencyKey !== "string" ||
    !body.source ||
    typeof body.source !== "object" ||
    Array.isArray(body.source) ||
    !body.options ||
    typeof body.options !== "object" ||
    Array.isArray(body.options)
  ) {
    throw new Error("The Studio Clips create request is invalid.");
  }
  return body as StudioClipsCreateRequest;
}
