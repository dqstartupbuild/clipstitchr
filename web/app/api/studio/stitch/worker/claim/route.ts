import { api } from "@/convex/_generated/api";
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
    assertStudioReelWorkerExactKeys(body, ["leaseSeconds", "workerId"]);
    if (
      typeof body.workerId !== "string" ||
      (body.leaseSeconds !== undefined && typeof body.leaseSeconds !== "number")
    ) {
      throw new Error("Studio Stitch worker claim is invalid.");
    }
    return createStudioReelWorkerJsonResponse(
      await convex.mutation(api.studioReelWorker.claim.claim, {
        ...(body.leaseSeconds !== undefined
          ? { leaseSeconds: body.leaseSeconds }
          : {}),
        secret,
        workerId: body.workerId,
      }),
    );
  } catch (error) {
    return createStudioReelWorkerErrorResponse(error);
  }
}
