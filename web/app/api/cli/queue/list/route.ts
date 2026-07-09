import { api } from "@/convex/_generated/api";
import { createCliAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/cli/createCliAuthenticationRequiredResponse";
import { getCliSessionFromRequest } from "@/lib/clipstitchr/server/cli/getCliSessionFromRequest";
import { createCliQueueListItem } from "@/lib/clipstitchr/server/cli/queue/createCliQueueListItem";
import { getCliQueuePostIsWithinWindow } from "@/lib/clipstitchr/server/cli/queue/getCliQueuePostIsWithinWindow";
import { getCliQueuePostScheduledAt } from "@/lib/clipstitchr/server/cli/queue/getCliQueuePostScheduledAt";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { decryptPostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/decryptPostBridgeApiKey";
import { listPostBridgePosts } from "@/lib/clipstitchr/server/postBridge/listPostBridgePosts";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getCliSessionFromRequest(request);

  if (!session) {
    return createCliAuthenticationRequiredResponse();
  }

  try {
    const convex = createConvexHttpClient();
    const secret = getRateLimitApiSecret();
    const postBridgeSecret = await convex.query(
      api.cliPostBridge.getCliPostBridgeSecret.getCliPostBridgeSecret,
      {
        ownerId: session.ownerId,
        secret,
      },
    );

    if (!postBridgeSecret?.encryptedApiKey) {
      throw new Error(
        "Add your Post Bridge API key in Account settings before viewing the queue.",
      );
    }

    await convex.mutation(
      api.cliRateLimits.consumeCliPostBridgeRead.consumeCliPostBridgeRead,
      {
        ownerId: session.ownerId,
        secret,
      },
    );

    const posts = (await listPostBridgePosts(
      decryptPostBridgeApiKey(postBridgeSecret.encryptedApiKey),
    )).filter((post) => getCliQueuePostIsWithinWindow(post));
    const sourceSummaries = await convex.query(
      api.cliQueue.listCliQueueSourceSummaries.listCliQueueSourceSummaries,
      {
        ownerId: session.ownerId,
        postIds: posts.map((post) => post.id),
        secret,
      },
    );
    const sourcesByPostId = new Map(
      sourceSummaries.map((source) => [source.postId, source]),
    );
    let queuePosition = 0;
    const items = posts.flatMap((post) => {
      const source = sourcesByPostId.get(post.id);

      if (!source) {
        return [];
      }

      const scheduledAt = getCliQueuePostScheduledAt(post);
      const item = createCliQueueListItem({
        post,
        queuePosition: scheduledAt ? undefined : (queuePosition += 1),
        source,
      });

      return [item];
    });

    return Response.json({
      items,
      windowHours: 24,
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
            : "Unable to load your upcoming queue.",
      },
      { status: 400 },
    );
  }
}
