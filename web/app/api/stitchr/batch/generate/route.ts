import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getAutomationWorkerSecret } from "@/lib/clipstitchr/server/automation/getAutomationWorkerSecret";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { readStitchrBatchGenerateRequest } from "@/lib/clipstitchr/server/readStitchrBatchGenerateRequest";
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
    const now = new Date().toISOString();
    const batchDate = getStitchrBatchDate(now);
    const input = request ? await readStitchrBatchGenerateRequest(request) : {};
    const result = (await createConvexHttpClient().mutation(
      api.stitchrBatch.plan,
      {
        secret: getAutomationWorkerSecret(),
        ownerId: userId,
        batchDate,
        now,
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
        ...(input.templateId ? { templateId: input.templateId } : {}),
      },
    )) as StitchrBatchPlanResult;

    return Response.json({
      batchDate,
      count: result.taskIds.length,
      message: result.message,
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
