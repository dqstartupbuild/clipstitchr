import type { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { api } from "@/convex/_generated/api";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { markHookLabPostDispatchFailed } from "@/lib/clipstitchr/server/hookLab/markHookLabPostDispatchFailed";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createId } from "@/lib/clipstitchr/utils/createId";

export async function retryHookLabPostRoute(request: Request, id: string) {
  const ownerId = await getAuthenticatedUserId();
  let convex: ConvexHttpClient | null = null;
  let analyzingPostId: string | null = null;
  let usageReservationId: string | null = null;

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
    const post = await convex.query(api.hookLabPosts.get.get, { id });

    if (!post) {
      throw new Error("Post not found.");
    }

    if (
      post.status !== "ready" &&
      post.status !== "failed" &&
      post.status !== "needs_attention"
    ) {
      throw new Error("This post is already being analyzed.");
    }

    const attemptId = createId();
    const jobId = `provider:hook-lab-post-analysis:${post.id}:${attemptId}`;
    const idempotencyKey = `${ownerId}:hook-lab-post-analysis:${post.id}:${attemptId}`;
    const rateLimitSecret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeHookLabPostAnalysis, {
      idempotencyKey,
      secret: rateLimitSecret,
    });
    const usage = await convex.mutation(
      anyApi.usage.reserveAnalysisCredit.reserveAnalysisCredit,
      {
        domainId: post.id,
        idempotencyKey,
        now: updatedAt,
        operation: "hook_lab_analysis",
        secret: rateLimitSecret,
      },
    );
    usageReservationId = usage?.reservationId ?? null;
    const postId = await convex.mutation(api.hookLabPosts.retry.retry, {
      id: post.id,
      updatedAt,
    });
    analyzingPostId = postId;
    const job = await convex.mutation(api.providerJobs.create, {
      createdAt: updatedAt,
      id: jobId,
      idempotencyKey,
      inputSnapshotJson: JSON.stringify({ postId }),
      jobType: "hook-lab-post-analysis",
      ownerId,
      secret: rateLimitSecret,
      stage: "awaiting-provider",
      usageReservationId: usage?.reservationId ?? undefined,
    });

    await capturePostHogServerEvent({
      distinctId: ownerId,
      event: "hook_lab_post_analysis_started",
      properties: {
        is_reanalysis: post.status === "ready",
        is_retry: true,
      },
      request,
    });

    return Response.json({ job, postId }, { status: 202 });
  } catch (error) {
    if (convex && analyzingPostId) {
      await markHookLabPostDispatchFailed({
        client: convex,
        postId: analyzingPostId,
      }).catch(() => undefined);
    }
    if (convex && usageReservationId) {
      await convex
        .mutation(anyApi.usage.releaseAnalysisCredit.releaseAnalysisCredit, {
          now: new Date().toISOString(),
          reason: "Hook Lab analysis could not be queued.",
          reservationId: usageReservationId,
          secret: getRateLimitApiSecret(),
        })
        .catch(() => undefined);
    }

    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to analyze that post again.",
      },
      { status: 400 },
    );
  }
}
