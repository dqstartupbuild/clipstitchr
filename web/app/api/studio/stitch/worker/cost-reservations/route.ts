import { api } from "@/convex/_generated/api";
import type { StudioReelWorkerProvider } from "@/lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerProvider";
import { assertStudioReelWorkerExactKeys } from "../_lib/assertStudioReelWorkerExactKeys";
import { createStudioReelWorkerErrorResponse } from "../_lib/createStudioReelWorkerErrorResponse";
import { createStudioReelWorkerJsonResponse } from "../_lib/createStudioReelWorkerJsonResponse";
import { getStudioReelWorkerClient } from "../_lib/getStudioReelWorkerClient";
import { readStudioReelWorkerJsonObject } from "../_lib/readStudioReelWorkerJsonObject";

export const runtime = "nodejs";

type ProviderOperation =
  | "acquire_reaction"
  | "analyze_demo"
  | "generate_voice"
  | "render_recipe";

export async function POST(request: Request) {
  try {
    const { convex, secret } = getStudioReelWorkerClient(request);
    const body = await readStudioReelWorkerJsonObject(request);
    assertStudioReelWorkerExactKeys(body, [
      "invocationId",
      "leaseAttempt",
      "leaseId",
      "operation",
      "ownerId",
      "productId",
      "provider",
      "recipeId",
      "runAttempt",
      "runId",
    ]);
    if (
      typeof body.invocationId !== "string" ||
      typeof body.leaseAttempt !== "number" ||
      typeof body.leaseId !== "string" ||
      typeof body.operation !== "string" ||
      typeof body.ownerId !== "string" ||
      typeof body.productId !== "string" ||
      typeof body.provider !== "string" ||
      typeof body.recipeId !== "string" ||
      typeof body.runAttempt !== "number" ||
      typeof body.runId !== "string"
    ) {
      throw new Error("Studio Stitch cost reservation request is invalid.");
    }
    return createStudioReelWorkerJsonResponse(
      await convex.mutation(api.studioReelWorker.reserveCost.reserveCost, {
        invocationId: body.invocationId,
        leaseAttempt: body.leaseAttempt,
        leaseId: body.leaseId,
        operation: body.operation as ProviderOperation,
        ownerId: body.ownerId,
        productId: body.productId,
        provider: body.provider as StudioReelWorkerProvider,
        recipeId: body.recipeId,
        runAttempt: body.runAttempt,
        runId: body.runId,
        secret,
      }),
    );
  } catch (error) {
    return createStudioReelWorkerErrorResponse(error);
  }
}
