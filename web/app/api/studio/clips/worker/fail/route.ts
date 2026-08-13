import { api } from "@/convex/_generated/api";
import type { StudioClipsCheckpoint } from "@/lib/clipstitchr/types/studioClips/StudioClipsCheckpoint";
import type { StudioClipsFailure } from "@/lib/clipstitchr/types/studioClips/StudioClipsFailure";
import type { StudioClipsResumePointer } from "@/lib/clipstitchr/types/studioClips/StudioClipsResumePointer";
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
      "checkpoint",
      "failure",
      "leaseId",
      "ownerId",
      "productId",
      "resume",
      "taskId",
    ]);
    if (
      typeof body.attempt !== "number" ||
      typeof body.checkpoint !== "string" ||
      !body.failure ||
      typeof body.failure !== "object" ||
      Array.isArray(body.failure) ||
      typeof body.leaseId !== "string" ||
      typeof body.ownerId !== "string" ||
      typeof body.productId !== "string" ||
      typeof body.taskId !== "string"
    ) {
      throw new Error("Studio Clips failure request is invalid.");
    }
    const { convex, secret } = getStudioClipsWorkerClient(request);
    return createStudioClipsPrivateJsonResponse(
      await convex.mutation(api.studioClipsWorker.fail.fail, {
        attempt: body.attempt,
        checkpoint: body.checkpoint as StudioClipsCheckpoint,
        failure: body.failure as StudioClipsFailure,
        leaseId: body.leaseId,
        ownerId: body.ownerId,
        productId: body.productId,
        ...(body.resume
          ? { resume: body.resume as StudioClipsResumePointer }
          : {}),
        secret,
        taskId: body.taskId,
      }),
    );
  } catch (error) {
    return createStudioClipsWorkerErrorResponse(error);
  }
}
