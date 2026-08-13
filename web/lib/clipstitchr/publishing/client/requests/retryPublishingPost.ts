import { readPublishingPostResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingPostResponse";
import { assertPublishingProductIds } from "@/lib/clipstitchr/publishing/client/assertPublishingProductIds";
import { createPublishingResponseMismatchError } from "@/lib/clipstitchr/publishing/client/createPublishingResponseMismatchError";

export async function retryPublishingPost(
  id: string,
  expectedProductId: string,
) {
  const response = await fetch(
    `/api/studio/publishing/posts/${encodeURIComponent(id)}/retry`,
    {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      method: "POST",
    },
  );
  const result = await readPublishingPostResponse(response);
  assertPublishingProductIds(expectedProductId, [result.post.productId]);
  if (result.post.id !== id) {
    throw createPublishingResponseMismatchError(
      "Publishing returned the wrong post after retrying.",
    );
  }
  return result;
}
