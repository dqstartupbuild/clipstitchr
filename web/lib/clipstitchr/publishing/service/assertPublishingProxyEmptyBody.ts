import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";

export async function assertPublishingProxyEmptyBody(
  request: Request,
): Promise<void> {
  const declaredLength = request.headers.get("content-length");

  if (
    declaredLength !== null &&
    (!/^\d+$/u.test(declaredLength) || Number(declaredLength) !== 0)
  ) {
    throw new PublishingProxyRequestError(400, "request_body_not_allowed");
  }

  if (request.body === null) {
    return;
  }

  const reader = request.body.getReader();
  const firstChunk = await reader.read();
  if (!firstChunk.done) {
    await reader.cancel();
    throw new PublishingProxyRequestError(400, "request_body_not_allowed");
  }
}
