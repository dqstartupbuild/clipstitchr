import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createCliAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/cli/createCliAuthenticationRequiredResponse";
import { getCliSessionFromRequest } from "@/lib/clipstitchr/server/cli/getCliSessionFromRequest";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getAutomationWorkerSecret } from "@/lib/clipstitchr/server/automation/getAutomationWorkerSecret";
import { dispatchStitchrBatchProviderWorkerFromApi } from "@/lib/clipstitchr/server/stitchr/dispatchStitchrBatchProviderWorkerFromApi";
import { getStitchrBatchDate } from "@/lib/clipstitchr/server/stitchr/getStitchrBatchDate";
import { readStitchrBatchGenerateRequest } from "@/lib/clipstitchr/server/readStitchrBatchGenerateRequest";
import { stitchrBatchProviderFallbackLaunchDelayMs } from "@/lib/clipstitchr/constants/stitchrBatchProviderFallbackLaunchDelayMs";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";

export const runtime = "nodejs";

type StitchrBatchPlanResult = {
  message?: string;
  runId: string;
  status: string;
  taskIds: string[];
};

export async function POST(request: Request) {
  const session = await getCliSessionFromRequest(request);

  if (!session) {
    return createCliAuthenticationRequiredResponse();
  }

  try {
    const convex = createConvexHttpClient();
    const now = new Date().toISOString();
    const input = await readStitchrBatchGenerateRequest(request);
    const batchDate = getStitchrBatchDate(now, input.timeZone);
    const result = (await convex.mutation(api.stitchrBatch.plan, {
      secret: getAutomationWorkerSecret(),
      ownerId: session.ownerId,
      batchDate,
      now,
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
      ...(input.templateId ? { templateId: input.templateId } : {}),
      ...(input.soundTrackId ? { soundTrackId: input.soundTrackId } : {}),
    })) as StitchrBatchPlanResult;
    const providerDispatchStatus =
      await dispatchStitchrBatchProviderWorkerFromApi({
        convex,
        shouldDispatch: result.taskIds.length > 0,
      });

    return NextResponse.json({
      batchDate,
      count: result.taskIds.length,
      hookPlanStatus: "worker",
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

    return NextResponse.json(
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
