import { readPublishingPostResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingPostResponse";
import { assertPublishingProductIds } from "@/lib/clipstitchr/publishing/client/assertPublishingProductIds";
import { createPublishingResponseMismatchError } from "@/lib/clipstitchr/publishing/client/createPublishingResponseMismatchError";

export async function getPublishingPost(
  id: string,
  expectedProductId: string,
  signal?: AbortSignal,
) {
  const response = await fetch(`/api/studio/publishing/posts/${encodeURIComponent(id)}`, {
    cache: "no-store",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
    signal,
  });
  const result = await readPublishingPostResponse(response);
  assertPublishingProductIds(expectedProductId, [result.post.productId]);
  if (result.post.id !== id) {
    throw createPublishingResponseMismatchError(
      "Publishing returned details for the wrong post.",
    );
  }
  return result;
}
