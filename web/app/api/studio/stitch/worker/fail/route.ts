import { api } from "@/convex/_generated/api";
import type { StudioReelWorkerCheckpoint } from "@/lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerCheckpoint";
import type { StudioReelWorkerFailure } from "@/lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerFailure";
import { assertStudioReelWorkerExactKeys } from "../_lib/assertStudioReelWorkerExactKeys";
import { createStudioReelWorkerErrorResponse } from "../_lib/createStudioReelWorkerErrorResponse";
import { createStudioReelWorkerJsonResponse } from "../_lib/createStudioReelWorkerJsonResponse";
import { getStudioReelWorkerClient } from "../_lib/getStudioReelWorkerClient";
import { readStudioReelWorkerJsonObject } from "../_lib/readStudioReelWorkerJsonObject";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { convex, secret } = getStudioReelWorkerClient(request);
    const body = await readStudioReelWorkerJsonObject(request);
    assertStudioReelWorkerExactKeys(body, [
      "checkpoint",
      "failure",
      "leaseAttempt",
      "leaseId",
      "ownerId",
      "productId",
      "recipeIndex",
      "runAttempt",
      "runId",
    ]);
    if (
      typeof body.checkpoint !== "string" ||
      !body.failure ||
      typeof body.failure !== "object" ||
      Array.isArray(body.failure) ||
      typeof body.leaseAttempt !== "number" ||
      typeof body.leaseId !== "string" ||
      typeof body.ownerId !== "string" ||
      typeof body.productId !== "string" ||
      typeof body.recipeIndex !== "number" ||
      typeof body.runAttempt !== "number" ||
      typeof body.runId !== "string"
    ) {
      throw new Error("Studio Stitch failure request is invalid.");
    }
    return createStudioReelWorkerJsonResponse(
      await convex.mutation(api.studioReelWorker.fail.fail, {
        checkpoint: body.checkpoint as StudioReelWorkerCheckpoint,
        failure: body.failure as StudioReelWorkerFailure,
        leaseAttempt: body.leaseAttempt,
        leaseId: body.leaseId,
        ownerId: body.ownerId,
        productId: body.productId,
        recipeIndex: body.recipeIndex,
        runAttempt: body.runAttempt,
        runId: body.runId,
        secret,
      }),
    );
  } catch (error) {
    return createStudioReelWorkerErrorResponse(error);
  }
}
