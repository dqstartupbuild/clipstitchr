import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAutomationWorkerSecret } from "@/lib/clipstitchr/server/automation/getAutomationWorkerSecret";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createStitchrBatchHookGeneration } from "@/lib/clipstitchr/server/createStitchrBatchHookGeneration";
import { createStitchrBatchHookPlanningInputFromTask } from "@/lib/clipstitchr/server/createStitchrBatchHookPlanningInputFromTask";
import { stitchrBatchProviderFallbackLaunchDelayMs } from "@/lib/clipstitchr/constants/stitchrBatchProviderFallbackLaunchDelayMs";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { readStitchrBatchGenerateRequest } from "@/lib/clipstitchr/server/readStitchrBatchGenerateRequest";
import { dispatchStitchrBatchProviderWorkerFromApi } from "@/lib/clipstitchr/server/stitchr/dispatchStitchrBatchProviderWorkerFromApi";
import { getStitchrBatchDate } from "@/lib/clipstitchr/server/stitchr/getStitchrBatchDate";
import type { ConvexHttpClient } from "convex/browser";

export const runtime = "nodejs";

type StitchrBatchPlanResult = {
  hookPlanningTaskIds?: string[];
  message?: string;
  runId: string;
  status: string;
  taskIds: string[];
};

async function saveBatchHookPlanningFailure({
  convex,
  reason,
  taskIds,
}: {
  convex: ConvexHttpClient;
  reason: string;
  taskIds: string[];
}) {
  if (!taskIds.length) {
    return;
  }

  await convex
    .mutation(api.stitchrHookPlans.saveBatchPlannerFailure, {
      reason,
      taskIds,
      updatedAt: new Date().toISOString(),
    })
    .catch(() => null);
}

async function planBatchHooks({
  convex,
  taskIds,
}: {
  convex: ConvexHttpClient;
  taskIds: string[];
}) {
  if (!taskIds.length) {
    return {
      hookPlanCount: 0,
      hookPlanStatus: "skipped",
    };
  }

  const taskInputs = await convex.query(
    api.stitchrHookPlans.listBatchPlanningInputs,
    {
      taskIds,
    },
  );
  const planningInputs = taskInputs
    .map(createStitchrBatchHookPlanningInputFromTask)
    .filter((input) => !input.hasTemplateTextOverlay);

  if (!planningInputs.length) {
    return {
      hookPlanCount: 0,
      hookPlanStatus: "skipped",
    };
  }

  try {
    await convex.mutation(api.rateLimits.consumeStitchrBatchHookPlan, {
      secret: getRateLimitApiSecret(),
    });

    const generation = await createStitchrBatchHookGeneration({
      inputs: planningInputs,
      replicate: createReplicateClient(),
    });
    const inputByTaskId = new Map(
      planningInputs.map((input) => [input.automationTaskId, input]),
    );
    const plans = generation.plans
      .map((plan) => {
        const input = inputByTaskId.get(plan.automationTaskId);

        return input
          ? {
              ...plan,
              automationRunId: input.automationRunId,
              demoClipId: input.demoClipId,
              demoClipName: input.demoClipName,
              productId: input.product.id,
              productName: input.product.name,
              ugcClipId: input.ugcClipId,
              ugcClipName: input.ugcClipName,
            }
          : null;
      })
      .filter((plan): plan is NonNullable<typeof plan> => Boolean(plan));
    const plannedTaskIds = new Set(plans.map((plan) => plan.automationTaskId));
    const missingTaskIds = planningInputs
      .map((input) => input.automationTaskId)
      .filter((taskId) => !plannedTaskIds.has(taskId));
    const now = new Date().toISOString();

    if (plans.length) {
      await convex.mutation(api.stitchrHookPlans.saveBatchPlannerResults, {
        plans,
        updatedAt: now,
      });
    }

    if (missingTaskIds.length) {
      await convex.mutation(api.stitchrHookPlans.saveBatchPlannerFailure, {
        reason: "The batch hook planner missed this stitch.",
        taskIds: missingTaskIds,
        updatedAt: now,
      });
    }

    return {
      hookPlanCount: plans.length,
      hookPlanStatus: missingTaskIds.length ? "partial" : "planned",
    };
  } catch (error) {
    await saveBatchHookPlanningFailure({
      convex,
      reason:
        error instanceof Error
          ? error.message
          : "The batch hook planner did not finish.",
      taskIds: planningInputs.map((input) => input.automationTaskId),
    });

    return {
      hookPlanCount: 0,
      hookPlanStatus: "failed",
    };
  }
}

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
    const batchDate = getStitchrBatchDate(now, input.timeZone);
    const result = (await convex.mutation(api.stitchrBatch.plan, {
      secret: getAutomationWorkerSecret(),
      ownerId: userId,
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
    const hookPlan = await planBatchHooks({
      convex,
      taskIds: result.hookPlanningTaskIds ?? result.taskIds,
    });
    const providerDispatchStatus =
      await dispatchStitchrBatchProviderWorkerFromApi({
        convex,
        shouldDispatch: result.taskIds.length > 0,
      });

    return Response.json({
      batchDate,
      count: result.taskIds.length,
      hookPlanCount: hookPlan.hookPlanCount,
      hookPlanStatus: hookPlan.hookPlanStatus,
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
