import { readR2JsonResponse } from "@/lib/clipstitchr/client/r2/readR2JsonResponse";
import type { SwipePublishingBundle } from "@/lib/clipstitchr/publishing/media/SwipePublishingBundle";

export async function requestSwipePublishingBundleCommit(input: {
  attemptId: string;
}) {
  const response = await fetch("/api/r2/swipe-publishing-commit", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const result = await readR2JsonResponse<{ bundle: SwipePublishingBundle }>(
    response,
  );

  return result.bundle;
}
