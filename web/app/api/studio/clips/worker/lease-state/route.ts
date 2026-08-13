import { api } from "@/convex/_generated/api";
import { assertStudioClipsExactKeys } from "../../_lib/assertStudioClipsExactKeys";
import { createStudioClipsWorkerErrorResponse } from "../../_lib/createStudioClipsWorkerErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsWorkerClient } from "../../_lib/getStudioClipsWorkerClient";
import { readStudioClipsJsonObject } from "../../_lib/readStudioClipsJsonObject";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await readStudioClipsJsonObject(request);
    assertStudioClipsExactKeys(body, [
      "attempt",
      "leaseId",
      "ownerId",
      "productId",
      "taskId",
    ]);
    if (
      typeof body.attempt !== "number" ||
      typeof body.leaseId !== "string" ||
      typeof body.ownerId !== "string" ||
      typeof body.productId !== "string" ||
      typeof body.taskId !== "string"
    ) {
      throw new Error("Studio Clips worker lease request is invalid.");
    }
    const { convex, secret } = getStudioClipsWorkerClient(request);
    return createStudioClipsPrivateJsonResponse(
      await convex.query(api.studioClipsWorker.getLeaseState.getLeaseState, {
        attempt: body.attempt,
        leaseId: body.leaseId,
        ownerId: body.ownerId,
        productId: body.productId,
        secret,
        taskId: body.taskId,
      }),
    );
  } catch (error) {
    return createStudioClipsWorkerErrorResponse(error);
  }
}
