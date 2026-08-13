import { api } from "@/convex/_generated/api";
import { assertStudioClipsExactKeys } from "../../_lib/assertStudioClipsExactKeys";
import { createStudioClipsWorkerErrorResponse } from "../../_lib/createStudioClipsWorkerErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsWorkerClient } from "../../_lib/getStudioClipsWorkerClient";
import { readStudioClipsJsonObject } from "../../_lib/readStudioClipsJsonObject";

export const runtime = "nodejs";

type StudioClipsCostStage =
  | "b_roll"
  | "download"
  | "llm"
  | "render"
  | "transcription";

export async function POST(request: Request) {
  try {
    const body = await readStudioClipsJsonObject(request);
    assertStudioClipsExactKeys(body, [
      "attempt",
      "leaseId",
      "ownerId",
      "productId",
      "stage",
      "taskId",
    ]);
    if (
      typeof body.attempt !== "number" ||
      typeof body.leaseId !== "string" ||
      typeof body.ownerId !== "string" ||
      typeof body.productId !== "string" ||
      typeof body.stage !== "string" ||
      typeof body.taskId !== "string"
    ) {
      throw new Error("Studio Clips cost reservation request is invalid.");
    }
    const { convex, secret } = getStudioClipsWorkerClient(request);
    return createStudioClipsPrivateJsonResponse(
      await convex.mutation(api.studioClipsWorker.reserveCost.reserveCost, {
        attempt: body.attempt,
        leaseId: body.leaseId,
        ownerId: body.ownerId,
        productId: body.productId,
        secret,
        stage: body.stage as StudioClipsCostStage,
        taskId: body.taskId,
      }),
    );
  } catch (error) {
    return createStudioClipsWorkerErrorResponse(error);
  }
}
