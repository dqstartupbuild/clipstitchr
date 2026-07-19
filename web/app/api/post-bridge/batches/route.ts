import { api } from "@/convex/_generated/api";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { readPostBridgeBatchRequest } from "@/lib/clipstitchr/server/postBridge/readPostBridgeBatchRequest";
import { resolvePostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/resolvePostBridgeApiKey";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createId } from "@/lib/clipstitchr/utils/createId";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const input = await readPostBridgeBatchRequest(request);
    const convex = createAuthenticatedConvexHttpClient(convexToken);

    await resolvePostBridgeApiKey(convex);

    for (const item of input.items) {
      const source =
        item.sourceType === "stitch"
          ? await convex.query(api.stitches.get, { id: item.sourceId })
          : await convex.query(api.swipes.get, { id: item.sourceId });

      if (!source) {
        throw new Error("One of the selected posts was not found.");
      }

      for (const { sourceObject } of item.mediaFiles) {
        assertR2ObjectKeyBelongsToUser(sourceObject.key, userId);
      }
    }

    const itemCount = input.items.length;
    const mediaSizeBytes = input.items.reduce(
      (total, item) =>
        total +
        item.mediaFiles.reduce(
          (itemTotal, { media }) => itemTotal + media.sizeBytes,
          0,
        ),
      0,
    );
    const batchId = createId();
    const jobId = `provider:post-bridge-batch:${batchId}`;
    const idempotencyKey = `${userId}:post-bridge-batch:${batchId}`;

    await convex.mutation(api.rateLimits.consumePostBridgeBatch, {
      idempotencyKey,
      itemCount,
      mediaSizeBytes,
      secret: getRateLimitApiSecret(),
    });
    await convex.mutation(api.providerJobs.create, {
      createdAt: new Date().toISOString(),
      id: jobId,
      idempotencyKey,
      inputSnapshotJson: JSON.stringify(input),
      jobType: "post-bridge-batch",
      ownerId: userId,
      secret: getRateLimitApiSecret(),
      stage: "awaiting-provider",
    });

    await capturePostHogServerEvent({
      distinctId: userId,
      event: "post_bridge_batch_queued",
      properties: {
        item_count: itemCount,
        media_size_bytes: mediaSizeBytes,
      },
      request,
    });

    return Response.json({ jobId }, { status: 202 });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start this scheduling batch.",
      },
      { status: 400 },
    );
  }
}
