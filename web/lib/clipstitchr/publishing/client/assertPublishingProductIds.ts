import { createPublishingResponseMismatchError } from "@/lib/clipstitchr/publishing/client/createPublishingResponseMismatchError";

export function assertPublishingProductIds(
  expectedProductId: string,
  receivedProductIds: readonly string[],
): void {
  if (
    !expectedProductId ||
    receivedProductIds.some((productId) => productId !== expectedProductId)
  ) {
    throw createPublishingResponseMismatchError(
      "Publishing returned results for a different Product.",
    );
  }
}
