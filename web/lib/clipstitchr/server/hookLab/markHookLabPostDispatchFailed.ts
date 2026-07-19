import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function markHookLabPostDispatchFailed({
  client,
  postId,
}: {
  client: ConvexHttpClient;
  postId: string;
}) {
  await client.mutation(
    api.hookLabPosts.markAnalysisDispatchFailed.markAnalysisDispatchFailed,
    {
      id: postId,
      updatedAt: new Date().toISOString(),
    },
  );
}
