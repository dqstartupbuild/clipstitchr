import { api } from "@/convex/_generated/api";
import type { StudioClipsAnalysis } from "@/lib/clipstitchr/types/studioClips/StudioClipsAnalysis";
import { assertStudioClipsExactKeys } from "../../_lib/assertStudioClipsExactKeys";
import { createStudioClipsWorkerErrorResponse } from "../../_lib/createStudioClipsWorkerErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsWorkerClient } from "../../_lib/getStudioClipsWorkerClient";
import { readStudioClipsJsonObject } from "../../_lib/readStudioClipsJsonObject";

export const runtime = "nodejs";

type WorkerOutput = {
  artifactId: string;
  audioCodec?: string;
  contentType: string;
  durationSeconds: number;
  fileName?: string;
  hasAudio: boolean;
  height: number;
  objectKey: string;
  sha256: string;
  sizeBytes: number;
  sourceOutputId?: string;
  videoCodec: string;
  width: number;
  cleanMaster?: {
    contentType: string;
    objectKey: string;
    sha256: string;
    sizeBytes: number;
  };
};

export async function POST(request: Request) {
  try {
    const body = await readStudioClipsJsonObject(request, 512 * 1024);
    assertStudioClipsExactKeys(body, [
      "analysis",
      "attempt",
      "leaseId",
      "outputs",
      "ownerId",
      "productId",
      "taskId",
    ]);
    if (
      typeof body.attempt !== "number" ||
      typeof body.leaseId !== "string" ||
      !Array.isArray(body.outputs) ||
      typeof body.ownerId !== "string" ||
      typeof body.productId !== "string" ||
      typeof body.taskId !== "string"
    ) {
      throw new Error("Studio Clips completion request is invalid.");
    }
    const { convex, secret } = getStudioClipsWorkerClient(request);
    return createStudioClipsPrivateJsonResponse(
      await convex.mutation(api.studioClipsWorker.complete.complete, {
        ...(body.analysis
          ? {
              analysisJson: JSON.stringify(
                body.analysis as StudioClipsAnalysis,
              ),
            }
          : {}),
        attempt: body.attempt,
        leaseId: body.leaseId,
        outputs: body.outputs as WorkerOutput[],
        ownerId: body.ownerId,
        productId: body.productId,
        secret,
        taskId: body.taskId,
      }),
    );
  } catch (error) {
    return createStudioClipsWorkerErrorResponse(error);
  }
}
