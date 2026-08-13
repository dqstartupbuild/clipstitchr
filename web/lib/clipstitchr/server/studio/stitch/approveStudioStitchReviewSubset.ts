import { api } from "@/convex/_generated/api";
import { getStudioStitchConvexClient } from "./getStudioStitchConvexClient";

export async function approveStudioStitchReviewSubset(
  id: string,
  request: {
    readonly productId: string;
    readonly approvedOutputIds: readonly string[];
    readonly expectedRevision: number;
    readonly idempotencyKey: string;
  },
) {
  return await (
    await getStudioStitchConvexClient()
  ).mutation(api.studioReelReviewSubsets.approve.approve, {
    id,
    ...request,
    approvedOutputIds: [...request.approvedOutputIds],
  });
}
