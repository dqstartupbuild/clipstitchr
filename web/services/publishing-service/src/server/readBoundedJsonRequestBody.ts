import { PublishingServiceHttpError } from "./PublishingServiceHttpError.js";
import type { BoundedJsonRequest } from "./BoundedJsonRequest.js";

export const readBoundedJsonRequestBody = async (
  request: BoundedJsonRequest,
  maximumBytes = 262_144,
): Promise<unknown> => {
  if (
    !Number.isSafeInteger(maximumBytes) ||
    maximumBytes < 2 ||
    maximumBytes > 1_048_576
  ) {
    throw new PublishingServiceHttpError(500, "invalid_server_configuration");
  }

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

  if (declaredLength !== undefined) {
    if (
      Array.isArray(declaredLength) ||
      !/^\d+$/.test(declaredLength) ||
      Number(declaredLength) > maximumBytes
    ) {
      throw new PublishingServiceHttpError(413, "request_too_large");
    }
  }

  const chunks: Buffer[] = [];
  let byteLength = 0;

  for await (const chunk of request.body) {
    const bytes = typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk);
    byteLength += bytes.byteLength;

    if (byteLength > maximumBytes) {
      throw new PublishingServiceHttpError(413, "request_too_large");
    }

    chunks.push(bytes);
  }

  if (byteLength === 0) {
    throw new PublishingServiceHttpError(400, "json_required");
  }

  try {
    return JSON.parse(Buffer.concat(chunks, byteLength).toString("utf8")) as unknown;
  } catch {
    throw new PublishingServiceHttpError(400, "invalid_json");
  }
};
