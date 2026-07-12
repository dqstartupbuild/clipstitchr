import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { markHookLabIdeaDispatchFailed } from "@/lib/clipstitchr/server/hookLab/markHookLabIdeaDispatchFailed";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { readCreateHookLabIdeaRequest } from "./readCreateHookLabIdeaRequest";

export async function createHookLabIdeaRoute(request: Request) {
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

    const input = await readCreateHookLabIdeaRequest(request);
    convex = createAuthenticatedConvexHttpClient(token);
    const createdAt = new Date().toISOString();
    const candidateIdeaId = createId();
    const idea = await convex.mutation(api.hookLabIdeas.create.create, {
      ...input,
      createdAt,
      id: candidateIdeaId,
    });
    const isNewIdea = idea.id === candidateIdeaId;

    if (idea.status === "ready") {
      return Response.json({ idea }, { status: 200 });
    }

    if (idea.status !== "analyzing") {
      const message =
        idea.status === "archived"
          ? "That idea is already archived. Open Archived ideas to find it."
          : "That idea is already saved and needs another try.";

      return Response.json({ idea, message }, { status: 409 });
    }

    analyzingIdeaId = idea.id;

    const jobId = `provider:hook-lab-idea-analysis:${idea.id}:initial`;
    const idempotencyKey = `${ownerId}:hook-lab-idea-analysis:${idea.id}:initial`;
    const rateLimitSecret = getRateLimitApiSecret();

    const reservation = await convex.mutation(
      api.rateLimits.consumeHookLabIdeaAnalysis,
      {
        idempotencyKey,
        isSocialImport: idea.sourceType === "social_link",
        secret: rateLimitSecret,
      },
    );

    if (isNewIdea) {
      await capturePostHogServerEvent({
        distinctId: ownerId,
        event: "hook_lab_idea_created",
        properties: {
          scope: idea.scope,
          source_platform: idea.sourcePlatform,
          source_type: idea.sourceType,
        },
        request,
      });
    }

    const job = await convex.mutation(api.providerJobs.create, {
      createdAt,
      id: jobId,
      idempotencyKey,
      inputSnapshotJson: JSON.stringify({ ideaId: idea.id }),
      jobType: "hook-lab-idea-analysis",
      ownerId,
      secret: rateLimitSecret,
      stage: "awaiting-provider",
    });

    if (!reservation?.alreadyReserved) {
      await capturePostHogServerEvent({
        distinctId: ownerId,
        event: "hook_lab_idea_analysis_started",
        properties: {
          is_retry: false,
          source_platform: idea.sourcePlatform,
          source_type: idea.sourceType,
        },
        request,
      });
    }

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
          error instanceof Error ? error.message : "Unable to save that idea.",
      },
      { status: 400 },
    );
  }
}
