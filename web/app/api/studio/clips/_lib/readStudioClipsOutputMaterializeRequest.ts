import type { StudioClipsOutputMaterializeRequest } from "@/lib/clipstitchr/types/studioClips/StudioClipsOutputMaterializeRequest";
import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { readStudioClipsJsonObject } from "./readStudioClipsJsonObject";

export async function readStudioClipsOutputMaterializeRequest(
  request: Request,
): Promise<StudioClipsOutputMaterializeRequest> {
  const body = await readStudioClipsJsonObject(request, 16 * 1024);
  assertStudioClipsExactKeys(body, [
    "expectedRevision",
    "idempotencyKey",
    "productId",
    "taskId",
  ]);
  if (
    !Number.isInteger(body.expectedRevision) ||
    (body.expectedRevision as number) < 1 ||
    typeof body.idempotencyKey !== "string" ||
    body.idempotencyKey.length < 1 ||
    body.idempotencyKey.length > 200 ||
    typeof body.productId !== "string" ||
    typeof body.taskId !== "string"
  ) {
    throw new Error("Studio Clips Library save request is invalid.");
  }
  return {
    expectedRevision: body.expectedRevision as number,
    idempotencyKey: body.idempotencyKey,
    productId: body.productId,
    taskId: body.taskId,
  };
}
