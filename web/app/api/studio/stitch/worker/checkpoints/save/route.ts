import { api } from "@/convex/_generated/api";
import type { StudioReelWorkerCheckpoint } from "@/lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerCheckpoint";
import { assertStudioReelWorkerExactKeys } from "../../_lib/assertStudioReelWorkerExactKeys";
import { createStudioReelWorkerErrorResponse } from "../../_lib/createStudioReelWorkerErrorResponse";
import { createStudioReelWorkerJsonResponse } from "../../_lib/createStudioReelWorkerJsonResponse";
import { getStudioReelWorkerClient } from "../../_lib/getStudioReelWorkerClient";
import { readStudioReelWorkerJsonObject } from "../../_lib/readStudioReelWorkerJsonObject";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { convex, secret } = getStudioReelWorkerClient(request);
    const body = await readStudioReelWorkerJsonObject(request, 160 * 1024);
    assertStudioReelWorkerExactKeys(body, [
      "checkpoint",
      "expectedRevision",
      "leaseAttempt",
      "leaseId",
      "ownerId",
      "productId",
      "recipeIndex",
      "runAttempt",
      "runId",
      "snapshotJson",
    ]);
    if (
      typeof body.checkpoint !== "string" ||
      typeof body.expectedRevision !== "number" ||
      typeof body.leaseAttempt !== "number" ||
      typeof body.leaseId !== "string" ||
      typeof body.ownerId !== "string" ||
      typeof body.productId !== "string" ||
      typeof body.recipeIndex !== "number" ||
      typeof body.runAttempt !== "number" ||
      typeof body.runId !== "string" ||
      typeof body.snapshotJson !== "string"
    ) {
      throw new Error("Studio Stitch checkpoint request is invalid.");
    }
    return createStudioReelWorkerJsonResponse(
      await convex.mutation(api.studioReelWorker.checkpoint.checkpoint, {
        checkpoint: body.checkpoint as StudioReelWorkerCheckpoint,
        expectedRevision: body.expectedRevision,
        leaseAttempt: body.leaseAttempt,
        leaseId: body.leaseId,
        ownerId: body.ownerId,
        productId: body.productId,
        recipeIndex: body.recipeIndex,
        runAttempt: body.runAttempt,
        runId: body.runId,
        secret,
        snapshotJson: body.snapshotJson,
      }),
    );
  } catch (error) {
    return createStudioReelWorkerErrorResponse(error);
  }
}
