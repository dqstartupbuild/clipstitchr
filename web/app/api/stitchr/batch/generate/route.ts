import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getAutomationDate } from "@/lib/clipstitchr/server/automation/getAutomationDate";
import { getAutomationWorkerSecret } from "@/lib/clipstitchr/server/automation/getAutomationWorkerSecret";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";

export const runtime = "nodejs";

type StitchrBatchPlanResult = {
  message?: string;
  runId: string;
  status: string;
  taskIds: string[];
};

export async function POST() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const now = new Date().toISOString();
    const automationDate = getAutomationDate(now);
    const result = (await createConvexHttpClient().mutation(
      api.automationStitchr.planDaily,
      {
        secret: getAutomationWorkerSecret(),
        ownerId: userId,
        automationDate,
        now,
      },
    )) as StitchrBatchPlanResult;

    return Response.json({
      automationDate,
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
