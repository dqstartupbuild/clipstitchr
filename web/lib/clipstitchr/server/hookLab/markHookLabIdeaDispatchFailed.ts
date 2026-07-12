import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export async function markHookLabIdeaDispatchFailed({
  client,
  ideaId,
}: {
  client: ConvexHttpClient;
  ideaId: string;
}) {
  await client.mutation(
    api.hookLabIdeas.markAnalysisDispatchFailed.markAnalysisDispatchFailed,
    {
      id: ideaId,
      secret: getRateLimitApiSecret(),
      updatedAt: new Date().toISOString(),
    },
  );
}
