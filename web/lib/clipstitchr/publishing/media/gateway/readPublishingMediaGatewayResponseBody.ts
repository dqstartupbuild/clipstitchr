import type { StreamingBlobPayloadOutputTypes } from "@smithy/types";

export function readPublishingMediaGatewayResponseBody(
  body: StreamingBlobPayloadOutputTypes | undefined,
) {
  if (!body) {
    throw new Error("Publishing media response body is missing.");
  }

  if (body instanceof ReadableStream) {
    return body;
  }

  if ("transformToWebStream" in body) {
    return body.transformToWebStream();
  }

  throw new Error("Publishing media response body cannot be streamed.");
}
