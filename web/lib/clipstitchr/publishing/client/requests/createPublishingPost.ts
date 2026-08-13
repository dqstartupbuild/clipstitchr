import type { PublishingCreatePostRequest } from "@/lib/clipstitchr/publishing/client/contracts/PublishingCreatePostRequest";
import { assertPublishingProductIds } from "@/lib/clipstitchr/publishing/client/assertPublishingProductIds";
import { createPublishingResponseMismatchError } from "@/lib/clipstitchr/publishing/client/createPublishingResponseMismatchError";
import { readPublishingCreatePostResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingCreatePostResponse";

export async function createPublishingPost(
  input: PublishingCreatePostRequest,
  expectedProductId: string,
) {
  const response = await fetch("/api/studio/publishing/posts", {
    body: JSON.stringify(input),
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const result = await readPublishingCreatePostResponse(response);
  assertPublishingProductIds(expectedProductId, [result.productId]);
  const requestedIds = new Set(
    input.destinations.map((destination) => destination.integrationId),
  );
  const returnedIds = new Set(
    result.destinations.map((destination) => destination.integrationId),
  );
  if (
    requestedIds.size !== input.destinations.length ||
    returnedIds.size !== result.destinations.length ||
    requestedIds.size !== returnedIds.size ||
    [...requestedIds].some((id) => !returnedIds.has(id))
  ) {
    throw createPublishingResponseMismatchError(
      "Publishing returned results for the wrong destinations.",
    );
  }
  return result;
}
