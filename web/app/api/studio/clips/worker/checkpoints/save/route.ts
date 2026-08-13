import { api } from "@/convex/_generated/api";
import { assertStudioClipsExactKeys } from "../../../_lib/assertStudioClipsExactKeys";
import { createStudioClipsWorkerErrorResponse } from "../../../_lib/createStudioClipsWorkerErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../../../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsWorkerClient } from "../../../_lib/getStudioClipsWorkerClient";
import { readStudioClipsJsonObject } from "../../../_lib/readStudioClipsJsonObject";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await readStudioClipsJsonObject(request, 300 * 1024);
    assertStudioClipsExactKeys(body, [
      "attempt",
      "checkpoint",
      "expectedRevision",
      "leaseId",
      "ownerId",
      "productId",
      "snapshotJson",
      "taskId",
    ]);
    if (
      typeof body.attempt !== "number" ||
      typeof body.checkpoint !== "string" ||
      typeof body.expectedRevision !== "number" ||
      typeof body.leaseId !== "string" ||
      typeof body.ownerId !== "string" ||
      typeof body.productId !== "string" ||
      typeof body.snapshotJson !== "string" ||
      typeof body.taskId !== "string"
    ) {
      throw new Error("Studio Clips checkpoint request is invalid.");
    }
    const { convex, secret } = getStudioClipsWorkerClient(request);
    return createStudioClipsPrivateJsonResponse(
      await convex.mutation(api.studioClipsWorker.checkpoint.checkpoint, {
        attempt: body.attempt,
        checkpoint: body.checkpoint as
          | "analyzed"
          | "b_roll_ready"
          | "media_validated"
          | "output_stored"
          | "rendered"
          | "source_acquired"
          | "transcribed",
        expectedRevision: body.expectedRevision,
        leaseId: body.leaseId,
        ownerId: body.ownerId,
        productId: body.productId,
        secret,
        snapshotJson: body.snapshotJson,
        taskId: body.taskId,
      }),
    );
  } catch (error) {
    return createStudioClipsWorkerErrorResponse(error);
  }
}
