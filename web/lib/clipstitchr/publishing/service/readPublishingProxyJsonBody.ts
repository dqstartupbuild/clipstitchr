import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";

const DEFAULT_MAXIMUM_PUBLISHING_PROXY_BODY_BYTES = 8_192;

export async function readPublishingProxyJsonBody(
  request: Request,
  maximumBytes = DEFAULT_MAXIMUM_PUBLISHING_PROXY_BODY_BYTES,
): Promise<unknown> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim();
  const contentEncoding = request.headers.get("content-encoding")?.trim();
  const declaredLength = request.headers.get("content-length");

  if (contentType !== "application/json") {
    throw new PublishingProxyRequestError(415, "json_required");
  }
  if (contentEncoding && contentEncoding !== "identity") {
    throw new PublishingProxyRequestError(415, "content_encoding_not_supported");
  }
  if (
    declaredLength !== null &&
    (!/^\d+$/u.test(declaredLength) || Number(declaredLength) > maximumBytes)
  ) {
    throw new PublishingProxyRequestError(413, "request_too_large");
  }
  if (!request.body) {
    throw new PublishingProxyRequestError(400, "json_required");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    byteLength += value.byteLength;
    if (byteLength > maximumBytes) {
      await reader.cancel();
      throw new PublishingProxyRequestError(413, "request_too_large");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    throw new PublishingProxyRequestError(400, "invalid_json");
  }
}
