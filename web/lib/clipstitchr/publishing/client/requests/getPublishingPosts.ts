import type { PublishingPostStatus } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostStatus";
import { assertPublishingProductIds } from "@/lib/clipstitchr/publishing/client/assertPublishingProductIds";
import { createPublishingResponseMismatchError } from "@/lib/clipstitchr/publishing/client/createPublishingResponseMismatchError";
import { readPublishingPostsResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingPostsResponse";

export async function getPublishingPosts(
  status: PublishingPostStatus | "all",
  expectedProductId: string,
  signal?: AbortSignal,
) {
  const query = new URLSearchParams();
  if (status !== "all") {
    query.set("status", status);
  }
  const response = await fetch(
    `/api/studio/publishing/posts${query.size ? `?${query}` : ""}`,
    {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      signal,
    },
  );
  const result = await readPublishingPostsResponse(response);
  assertPublishingProductIds(
    expectedProductId,
    result.posts.map((post) => post.productId),
  );
  if (
    status !== "all" &&
    result.posts.some((post) => post.status !== status)
  ) {
    throw createPublishingResponseMismatchError(
      "Publishing returned posts outside the selected status.",
    );
  }
  return result;
}
