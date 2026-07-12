import { api } from "@/convex/_generated/api";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { markHookLabIdeaDispatchFailed } from "@/lib/clipstitchr/server/hookLab/markHookLabIdeaDispatchFailed";
import type { ConvexHttpClient } from "convex/browser";

export async function retryHookLabIdeaRoute(request: Request, id: string) {
  const ownerId = await getAuthenticatedUserId();
  let convex: ConvexHttpClient | null = null;
  let analyzingIdeaId: string | null = null;

  if (!ownerId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const token = await getAuthenticatedConvexToken();

    if (!token) {
      throw new Error("Unable to create a Convex auth token.");
    }

    convex = createAuthenticatedConvexHttpClient(token);
    const updatedAt = new Date().toISOString();
    const idea = await convex.mutation(api.hookLabIdeas.retry.retry, {
      id,
      updatedAt,
    });
    analyzingIdeaId = idea.id;
    const attemptId = createId();
    const jobId = `provider:hook-lab-idea-analysis:${idea.id}:${attemptId}`;
    const idempotencyKey = `${ownerId}:hook-lab-idea-analysis:${idea.id}:${attemptId}`;
    const rateLimitSecret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeHookLabIdeaAnalysis, {
      idempotencyKey,
      isSocialImport: idea.sourceType === "social_link",
      secret: rateLimitSecret,
    });
    const job = await convex.mutation(api.providerJobs.create, {
      createdAt: updatedAt,
      id: jobId,
      idempotencyKey,
      inputSnapshotJson: JSON.stringify({ ideaId: idea.id }),
      jobType: "hook-lab-idea-analysis",
      ownerId,
      secret: rateLimitSecret,
      stage: "awaiting-provider",
    });

    await capturePostHogServerEvent({
      distinctId: ownerId,
      event: "hook_lab_idea_analysis_started",
      properties: {
        is_retry: true,
        source_platform: idea.sourcePlatform,
        source_type: idea.sourceType,
      },
      request,
    });

    return Response.json({ idea, job }, { status: 202 });
  } catch (error) {
    if (convex && analyzingIdeaId) {
      await markHookLabIdeaDispatchFailed({
        client: convex,
        ideaId: analyzingIdeaId,
      }).catch(() => undefined);
    }

    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to try that idea again.",
      },
      { status: 400 },
    );
  }
}
