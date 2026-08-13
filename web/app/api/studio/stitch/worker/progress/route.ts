import { api } from "@/convex/_generated/api";
import type { StudioReelWorkerCheckpoint } from "@/lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerCheckpoint";
import { assertStudioReelWorkerExactKeys } from "../_lib/assertStudioReelWorkerExactKeys";
import { createStudioReelWorkerErrorResponse } from "../_lib/createStudioReelWorkerErrorResponse";
import { createStudioReelWorkerJsonResponse } from "../_lib/createStudioReelWorkerJsonResponse";
import { getStudioReelWorkerClient } from "../_lib/getStudioReelWorkerClient";
import { readStudioReelWorkerJsonObject } from "../_lib/readStudioReelWorkerJsonObject";

export const runtime = "nodejs";

type ProgressCode =
  | "worker_started"
  | "sources_acquired"
  | "gemini_ready"
  | "voice_ready"
  | "rendered"
  | "output_stored"
  | "completed"
  | "cancelled"
  | "failed";

export async function POST(request: Request) {
  try {
    const { convex, secret } = getStudioReelWorkerClient(request);
    const body = await readStudioReelWorkerJsonObject(request);
    assertStudioReelWorkerExactKeys(body, [
      "checkpoint",
      "code",
      "leaseAttempt",
      "leaseId",
      "occurredAt",
      "ownerId",
      "productId",
      "progressPercent",
      "recipeId",
      "recipeIndex",
      "runAttempt",
      "runId",
      "state",
    ]);
    if (
      typeof body.checkpoint !== "string" ||
      typeof body.code !== "string" ||
      typeof body.leaseAttempt !== "number" ||
      typeof body.leaseId !== "string" ||
      typeof body.occurredAt !== "string" ||
      typeof body.ownerId !== "string" ||
      typeof body.productId !== "string" ||
      typeof body.progressPercent !== "number" ||
      typeof body.recipeIndex !== "number" ||
      typeof body.runAttempt !== "number" ||
      typeof body.runId !== "string" ||
      typeof body.state !== "string"
    ) {
      throw new Error("Studio Stitch worker progress request is invalid.");
    }
    return createStudioReelWorkerJsonResponse(
      await convex.mutation(api.studioReelWorker.progress.progress, {
        checkpoint: body.checkpoint as StudioReelWorkerCheckpoint,
        code: body.code as ProgressCode,
        leaseAttempt: body.leaseAttempt,
        leaseId: body.leaseId,
        occurredAt: body.occurredAt,
        ownerId: body.ownerId,
        productId: body.productId,
        progressPercent: body.progressPercent,
        ...(typeof body.recipeId === "string"
          ? { recipeId: body.recipeId }
          : {}),
        recipeIndex: body.recipeIndex,
        runAttempt: body.runAttempt,
        runId: body.runId,
        secret,
        state: body.state as "processing" | "cancelled" | "failed" | "completed",
      }),
    );
  } catch (error) {
    return createStudioReelWorkerErrorResponse(error);
  }
}
