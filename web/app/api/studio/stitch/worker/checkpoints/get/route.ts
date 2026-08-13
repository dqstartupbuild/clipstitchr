import { api } from "@/convex/_generated/api";
import { assertStudioReelWorkerExactKeys } from "../../_lib/assertStudioReelWorkerExactKeys";
import { createStudioReelWorkerErrorResponse } from "../../_lib/createStudioReelWorkerErrorResponse";
import { createStudioReelWorkerJsonResponse } from "../../_lib/createStudioReelWorkerJsonResponse";
import { getStudioReelWorkerClient } from "../../_lib/getStudioReelWorkerClient";
import { readStudioReelWorkerJsonObject } from "../../_lib/readStudioReelWorkerJsonObject";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { convex, secret } = getStudioReelWorkerClient(request);
    const body = await readStudioReelWorkerJsonObject(request);
    assertStudioReelWorkerExactKeys(body, [
      "leaseAttempt",
      "leaseId",
      "ownerId",
      "productId",
      "revision",
      "runAttempt",
      "runId",
    ]);
    if (
      typeof body.leaseAttempt !== "number" ||
      typeof body.leaseId !== "string" ||
      typeof body.ownerId !== "string" ||
      typeof body.productId !== "string" ||
      typeof body.revision !== "number" ||
      typeof body.runAttempt !== "number" ||
      typeof body.runId !== "string"
    ) {
      throw new Error("Studio Stitch checkpoint restore request is invalid.");
    }
    return createStudioReelWorkerJsonResponse(
      await convex.query(api.studioReelWorker.getCheckpoint.getCheckpoint, {
        leaseAttempt: body.leaseAttempt,
        leaseId: body.leaseId,
        ownerId: body.ownerId,
        productId: body.productId,
        revision: body.revision,
        runAttempt: body.runAttempt,
        runId: body.runId,
        secret,
      }),
    );
  } catch (error) {
    return createStudioReelWorkerErrorResponse(error);
  }
}
