import { api } from "@/convex/_generated/api";
import type { StudioClipsProgressEvent } from "@/lib/clipstitchr/types/studioClips/StudioClipsProgressEvent";
import { assertStudioClipsExactKeys } from "../../_lib/assertStudioClipsExactKeys";
import { createStudioClipsWorkerErrorResponse } from "../../_lib/createStudioClipsWorkerErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsWorkerClient } from "../../_lib/getStudioClipsWorkerClient";
import { readStudioClipsJsonObject } from "../../_lib/readStudioClipsJsonObject";

export const runtime = "nodejs";

type WorkerProgressEvent = StudioClipsProgressEvent & {
  ownerId: string;
  productId: string;
  taskId: string;
};

export async function POST(request: Request) {
  try {
    const body = await readStudioClipsJsonObject(request);
    assertStudioClipsExactKeys(body, ["event", "leaseId"]);
    if (
      typeof body.leaseId !== "string" ||
      !body.event ||
      typeof body.event !== "object" ||
      Array.isArray(body.event)
    ) {
      throw new Error("Studio Clips worker progress request is invalid.");
    }
    const { convex, secret } = getStudioClipsWorkerClient(request);
    return createStudioClipsPrivateJsonResponse(
      await convex.mutation(api.studioClipsWorker.progress.progress, {
        event: body.event as WorkerProgressEvent,
        leaseId: body.leaseId,
        secret,
      }),
    );
  } catch (error) {
    return createStudioClipsWorkerErrorResponse(error);
  }
}
