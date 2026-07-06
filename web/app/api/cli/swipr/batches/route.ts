import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createCliAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/cli/createCliAuthenticationRequiredResponse";
import { getCliSessionFromRequest } from "@/lib/clipstitchr/server/cli/getCliSessionFromRequest";
import { readCliJsonObject } from "@/lib/clipstitchr/server/cli/readCliJsonObject";
import { readCliOptionalString } from "@/lib/clipstitchr/server/cli/readCliOptionalString";
import { getAutomationDate } from "@/lib/clipstitchr/server/automation/getAutomationDate";
import { getAutomationWorkerSecret } from "@/lib/clipstitchr/server/automation/getAutomationWorkerSecret";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createId } from "@/lib/clipstitchr/utils/createId";

export const runtime = "nodejs";

async function readOptionalBody(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return {};
  }

  return await readCliJsonObject(request);
}

export async function POST(request: Request) {
  const session = await getCliSessionFromRequest(request);

  if (!session) {
    return createCliAuthenticationRequiredResponse();
  }

  try {
    const body = await readOptionalBody(request);
    const now = new Date().toISOString();
    const automationDate = getAutomationDate(now);
    const convex = createConvexHttpClient();
    const result = await convex.mutation(api.cliSwipr.planCliSwiprBatch.planCliSwiprBatch, {
      batchId: createId(),
      secret: getRateLimitApiSecret(),
      ownerId: session.ownerId,
      productId: readCliOptionalString(body, "productId"),
      automationDate,
      now,
    });

    if (result.taskIds.length > 0) {
      await convex
        .action(api.workerDispatch.runWorkerFromApi, {
          secret: getAutomationWorkerSecret(),
          worker: "provider",
        })
        .catch(() => null);
    }

    return NextResponse.json({
      automationDate,
      count: result.taskIds.length,
      runId: result.runId,
      status: result.status,
      taskIds: result.taskIds,
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to generate Swipe drafts.",
      },
      { status: 400 },
    );
  }
}
