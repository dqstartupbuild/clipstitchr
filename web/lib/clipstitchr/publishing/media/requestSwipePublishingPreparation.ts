import { readR2JsonResponse } from "@/lib/clipstitchr/client/r2/readR2JsonResponse";
import type { SwipePublishingPreparationResponse } from "@/lib/clipstitchr/publishing/media/SwipePublishingPreparationResponse";

type RequestSwipePublishingPreparationOptions = {
  revision?: string;
  slides?: Array<{
    checksumSha256: string;
    index: number;
    sizeBytes: number;
  }>;
  swipeId: string;
};

export async function requestSwipePublishingPreparation(
  options: RequestSwipePublishingPreparationOptions,
) {
  const response = await fetch("/api/r2/swipe-publishing-upload-grants", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  return await readR2JsonResponse<SwipePublishingPreparationResponse>(response);
}
