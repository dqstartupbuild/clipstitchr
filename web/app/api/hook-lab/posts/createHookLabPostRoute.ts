import type { ConvexHttpClient } from "convex/browser";
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
import { readCreateHookLabPostRequest } from "./readCreateHookLabPostRequest";

export async function createHookLabPostRoute(request: Request) {
  const ownerId = await getAuthenticatedUserId();
  let convex: ConvexHttpClient | null = null;
  let analyzingPostId: string | null = null;

  if (!ownerId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const token = await getAuthenticatedConvexToken();

    if (!token) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const input = await readCreateHookLabPostRequest(request);
    convex = createAuthenticatedConvexHttpClient(token);
    const createdAt = new Date().toISOString();
    const candidatePostId = createId();
    const requestKey = `${ownerId}:${input.canonicalUrl}`;
    const post = await convex.mutation(api.hookLabPosts.create.create, {
      ...input,
      createdAt,
      id: candidatePostId,
      requestKey,
    });
    const isNewPost = post.id === candidatePostId;

    if (post.status === "ready") {
      return Response.json({ post }, { status: 200 });
    }

    if (post.status !== "analyzing") {
      return Response.json(
        {
          post,
          message: "That post is already saved and needs another analysis.",
        },
        { status: 409 },
      );
    }

    analyzingPostId = post.id;

    if (!isNewPost) {
      return Response.json({ post }, { status: 202 });
    }

    const attemptId = createId();
    const jobId = `provider:hook-lab-post-analysis:${post.id}:${attemptId}`;
    const idempotencyKey = `${ownerId}:hook-lab-post-analysis:${post.id}:${attemptId}`;
    const rateLimitSecret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeHookLabPostAnalysis, {
      idempotencyKey,
      secret: rateLimitSecret,
    });
    const job = await convex.mutation(api.providerJobs.create, {
      createdAt,
      id: jobId,
      idempotencyKey,
      inputSnapshotJson: JSON.stringify({ postId: post.id }),
      jobType: "hook-lab-post-analysis",
      ownerId,
      secret: rateLimitSecret,
      stage: "awaiting-provider",
    });

    await capturePostHogServerEvent({
      distinctId: ownerId,
      event: "hook_lab_post_analysis_started",
      properties: {
        is_retry: false,
        platform: post.platform,
      },
      request,
    });

    return Response.json({ job, post }, { status: 202 });
  } catch (error) {
    if (convex && analyzingPostId) {
      await markHookLabPostDispatchFailed({
        client: convex,
        postId: analyzingPostId,
      }).catch(() => undefined);
    }

    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to save that post.",
      },
      { status: 400 },
    );
  }
}
