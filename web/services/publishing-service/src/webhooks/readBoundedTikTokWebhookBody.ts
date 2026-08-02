import type { IncomingMessage } from "node:http";

import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";

export const MAXIMUM_TIKTOK_WEBHOOK_BYTES = 65_536;

export const readBoundedTikTokWebhookBody = async (
  request: IncomingMessage,
): Promise<Uint8Array> => {
  const contentType = request.headers["content-type"];
  const contentEncoding = request.headers["content-encoding"];
  const declaredLength = request.headers["content-length"];
  if (
    typeof contentType !== "string" ||
    contentType.split(";", 1)[0]?.trim().toLowerCase() !== "application/json" ||
    contentEncoding !== undefined
  ) {
    throw new PublishingServiceHttpError(415, "json_required");
  }
  if (
    declaredLength !== undefined &&
    (Array.isArray(declaredLength) ||
      !/^\d+$/u.test(declaredLength) ||
      Number(declaredLength) > MAXIMUM_TIKTOK_WEBHOOK_BYTES)
  ) {
    throw new PublishingServiceHttpError(413, "request_too_large");
  }

  const chunks: Buffer[] = [];
  let byteLength = 0;
  for await (const chunk of request) {
    const bytes = typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk);
    byteLength += bytes.byteLength;
    if (byteLength > MAXIMUM_TIKTOK_WEBHOOK_BYTES) {
      throw new PublishingServiceHttpError(413, "request_too_large");
    }
    chunks.push(bytes);
  }
  if (byteLength === 0) {
    throw new PublishingServiceHttpError(400, "json_required");
  }
  return Buffer.concat(chunks, byteLength);
};
