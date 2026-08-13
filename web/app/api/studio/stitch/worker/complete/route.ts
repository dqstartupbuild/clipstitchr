import { api } from "@/convex/_generated/api";
import type { StudioReelWorkerDurableOutput } from "@/lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerDurableOutput";
import { assertStudioReelWorkerExactKeys } from "../_lib/assertStudioReelWorkerExactKeys";
import { createStudioReelWorkerErrorResponse } from "../_lib/createStudioReelWorkerErrorResponse";
import { createStudioReelWorkerJsonResponse } from "../_lib/createStudioReelWorkerJsonResponse";
import { getStudioReelWorkerClient } from "../_lib/getStudioReelWorkerClient";
import { readStudioReelWorkerJsonObject } from "../_lib/readStudioReelWorkerJsonObject";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { convex, secret } = getStudioReelWorkerClient(request);
    const body = await readStudioReelWorkerJsonObject(request, 256 * 1024);
    assertStudioReelWorkerExactKeys(body, [
      "leaseAttempt",
      "leaseId",
      "outputs",
      "ownerId",
      "productId",
      "runAttempt",
      "runId",
    ]);
    if (
      typeof body.leaseAttempt !== "number" ||
      typeof body.leaseId !== "string" ||
      !Array.isArray(body.outputs) ||
      typeof body.ownerId !== "string" ||
      typeof body.productId !== "string" ||
      typeof body.runAttempt !== "number" ||
      typeof body.runId !== "string"
    ) {
      throw new Error("Studio Stitch completion request is invalid.");
    }
    return createStudioReelWorkerJsonResponse(
      await convex.mutation(api.studioReelWorker.complete.complete, {
        leaseAttempt: body.leaseAttempt,
        leaseId: body.leaseId,
        outputs: body.outputs as StudioReelWorkerDurableOutput[],
        ownerId: body.ownerId,
        productId: body.productId,
        runAttempt: body.runAttempt,
        runId: body.runId,
        secret,
      }),
    );
  } catch (error) {
    return createStudioReelWorkerErrorResponse(error);
  }
}
