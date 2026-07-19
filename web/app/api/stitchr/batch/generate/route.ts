import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAutomationWorkerSecret } from "@/lib/clipstitchr/server/automation/getAutomationWorkerSecret";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { stitchrBatchProviderFallbackLaunchDelayMs } from "@/lib/clipstitchr/constants/stitchrBatchProviderFallbackLaunchDelayMs";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { readStitchrBatchGenerateRequest } from "@/lib/clipstitchr/server/readStitchrBatchGenerateRequest";
import { dispatchStitchrBatchProviderWorkerFromApi } from "@/lib/clipstitchr/server/stitchr/dispatchStitchrBatchProviderWorkerFromApi";
import { getStitchrBatchDate } from "@/lib/clipstitchr/server/stitchr/getStitchrBatchDate";

export const runtime = "nodejs";

type StitchrBatchPlanResult = {
  message?: string;
  runId: string;
  status: string;
  taskIds: string[];
};

export async function POST(request?: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const now = new Date().toISOString();
    const input = request ? await readStitchrBatchGenerateRequest(request) : {};
    const productId = input.productId?.trim();

    if (!productId) {
      throw new Error("Choose a product before generating Stitch drafts.");
    }

    const batchDate = getStitchrBatchDate(now, input.timeZone);
    const runKey = crypto.randomUUID();
    const result = (await convex.mutation(api.stitchrBatch.plan, {
      secret: getAutomationWorkerSecret(),
      ownerId: userId,
      batchDate,
      now,
      productId,
      runKey,
      providerLaunchDelayMs: stitchrBatchProviderFallbackLaunchDelayMs,
      ...(input.stitchrTextBackgroundColorChoice
        ? {
            stitchrTextBackgroundColorChoice:
              input.stitchrTextBackgroundColorChoice,
          }
        : {}),
      ...(input.stitchrTextColorChoice
        ? { stitchrTextColorChoice: input.stitchrTextColorChoice }
        : {}),
      ...(input.stitchrTextStrokeColorChoice
        ? { stitchrTextStrokeColorChoice: input.stitchrTextStrokeColorChoice }
        : {}),
      ...(input.stitchrTextStyleChoice
        ? { stitchrTextStyleChoice: input.stitchrTextStyleChoice }
        : {}),
      ...(input.soundTrackId ? { soundTrackId: input.soundTrackId } : {}),
    })) as StitchrBatchPlanResult;
    const providerDispatchStatus =
      await dispatchStitchrBatchProviderWorkerFromApi({
        convex,
        shouldDispatch: result.taskIds.length > 0,
      });

    return Response.json({
      batchDate,
      count: result.taskIds.length,
      message: result.message,
      providerDispatchStatus,
      runId: result.runId,
      status: result.status,
      taskIds: result.taskIds,
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to generate Stitch drafts.",
      },
      { status: 400 },
    );
  }
}
