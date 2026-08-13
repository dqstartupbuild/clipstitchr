import type { StudioClipsOutputUpdateRequest } from "@/lib/clipstitchr/types/studioClips/StudioClipsOutputUpdateRequest";
import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { readStudioClipsJsonObject } from "./readStudioClipsJsonObject";

export async function readStudioClipsOutputUpdateRequest(
  request: Request,
): Promise<StudioClipsOutputUpdateRequest> {
  const body = await readStudioClipsJsonObject(request, 128 * 1024);
  assertStudioClipsExactKeys(body, [
    "edit",
    "expectedRevision",
    "idempotencyKey",
    "productId",
    "taskId",
  ]);
  if (
    typeof body.productId !== "string" ||
    typeof body.taskId !== "string" ||
    typeof body.idempotencyKey !== "string" ||
    typeof body.expectedRevision !== "number" ||
    !body.edit ||
    typeof body.edit !== "object" ||
    Array.isArray(body.edit)
  ) {
    throw new Error("The Studio Clips output update request is invalid.");
  }
  return body as StudioClipsOutputUpdateRequest;
}
