import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { readStudioClipsJsonObject } from "./readStudioClipsJsonObject";

export async function readStudioClipsTaskActionRequest(request: Request) {
  const body = await readStudioClipsJsonObject(request);
  assertStudioClipsExactKeys(body, ["idempotencyKey", "productId"]);
  if (
    typeof body.productId !== "string" ||
    typeof body.idempotencyKey !== "string"
  ) {
    throw new Error("The Studio Clips task action request is invalid.");
  }
  return { idempotencyKey: body.idempotencyKey, productId: body.productId };
}
