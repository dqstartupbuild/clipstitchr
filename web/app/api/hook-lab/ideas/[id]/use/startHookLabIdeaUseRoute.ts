import { api } from "@/convex/_generated/api";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { readUseHookLabIdeaRequest } from "./readUseHookLabIdeaRequest";

export async function startHookLabIdeaUseRoute(request: Request, ideaId: string) {
  const ownerId = await getAuthenticatedUserId();

  if (!ownerId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const token = await getAuthenticatedConvexToken();

    if (!token) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const input = await readUseHookLabIdeaRequest(request);
    const convex = createAuthenticatedConvexHttpClient(token);
    const createdAt = new Date().toISOString();

    if (input.saveDefaults) {
      await convex.mutation(api.hookLabDefaults.set.set, {
        defaultAvatarId: input.defaultAvatarId,
        defaultDemoClipId: input.defaultDemoClipId,
        productId: input.productId,
        updatedAt: createdAt,
      });
    }

    const useId = createId();
    const requestId = request.headers.get("idempotency-key")?.trim() || useId;
    const use = await convex.mutation(api.hookLabIdeaUses.create.create, {
      createdAt,
      defaultAvatarId: input.defaultAvatarId,
      defaultDemoClipId: input.defaultDemoClipId,
      id: useId,
      ideaId,
      idempotencyKey: `${ownerId}:hook-lab-idea-use:${requestId}`,
      productId: input.productId,
      variationCount: input.variationCount,
    });
    const rateLimitSecret = getRateLimitApiSecret();
    const jobs = [];
    let dispatchFailureCount = 0;

    for (const variantId of use.variantIds) {
      const providerJobId = `provider:hook-lab-idea-use:${variantId}`;

      try {
        const job = await convex.mutation(
          api.hookLabIdeaVariants.dispatchProviderJob.dispatchProviderJob,
          {
            createdAt,
            id: variantId,
            idempotencyKey: `${ownerId}:hook-lab-idea-use:${variantId}`,
            providerJobId,
            secret: rateLimitSecret,
          },
        );
        jobs.push(job);
      } catch {
        dispatchFailureCount += 1;
        await convex
          .mutation(api.hookLabIdeaVariants.failDispatch.failDispatch, {
            id: variantId,
            secret: rateLimitSecret,
            updatedAt: new Date().toISOString(),
          })
          .catch(() => undefined);
      }
    }

    await capturePostHogServerEvent({
      distinctId: ownerId,
      event: "hook_lab_idea_used",
      properties: {
        variation_count: input.variationCount,
      },
      request,
    });

    return Response.json(
      {
        jobs,
        dispatchFailureCount,
        message:
          dispatchFailureCount > 0
            ? `${dispatchFailureCount} ${dispatchFailureCount === 1 ? "version could" : "versions could"} not start. The others will keep going.`
            : undefined,
        useId: use.useId,
        variantIds: use.variantIds,
      },
      { status: 202 },
    );
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to use that idea.",
      },
      { status: 400 },
    );
  }
}
