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
    assertStudioClipsExactKeys(body, ["leaseSeconds", "workerId"]);
    if (
      typeof body.workerId !== "string" ||
      (body.leaseSeconds !== undefined && typeof body.leaseSeconds !== "number")
    ) {
      throw new Error("Studio Clips worker claim is invalid.");
    }
    const { convex, secret } = getStudioClipsWorkerClient(request);
    return createStudioClipsPrivateJsonResponse(
      await convex.mutation(api.studioClipsWorker.claim.claim, {
        ...(body.leaseSeconds !== undefined
          ? { leaseSeconds: body.leaseSeconds }
          : {}),
        secret,
        workerId: body.workerId,
      }),
    );
  } catch (error) {
    return createStudioClipsWorkerErrorResponse(error);
  }
}
