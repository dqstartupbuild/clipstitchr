import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { readStudioClipsJsonObject } from "./readStudioClipsJsonObject";

export async function readStudioClipsOutputAccessRequest(request: Request) {
  const body = await readStudioClipsJsonObject(request);
  assertStudioClipsExactKeys(body, ["productId", "taskId"]);
  if (typeof body.productId !== "string" || typeof body.taskId !== "string") {
    throw new Error("The Studio Clips output request is invalid.");
  }
  return { productId: body.productId, taskId: body.taskId };
}
