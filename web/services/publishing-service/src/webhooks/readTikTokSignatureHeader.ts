import type { IncomingMessage } from "node:http";

import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";

export const readTikTokSignatureHeader = (
  request: IncomingMessage,
): string => {
  const values: string[] = [];
  for (let index = 0; index < request.rawHeaders.length; index += 2) {
    if (request.rawHeaders[index]?.toLowerCase() === "tiktok-signature") {
      const value = request.rawHeaders[index + 1];
      if (value !== undefined) {
        values.push(value);
      }
    }
  }

  const signature = values[0];
  if (
    values.length !== 1 ||
    signature === undefined ||
    signature.length > 256
  ) {
    throw new PublishingServiceHttpError(401, "invalid_tiktok_signature");
  }
  return signature;
};
