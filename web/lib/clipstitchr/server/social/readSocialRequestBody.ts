const SOCIAL_REQUEST_MAX_BODY_BYTES = 64 * 1024;

export async function readSocialRequestBody(request: Request) {
  const declaredLength = Number(request.headers.get("content-length"));

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > SOCIAL_REQUEST_MAX_BODY_BYTES
  ) {
    throw new Error("This social request is too large.");
  }

  if (!request.body) {
    return "";
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    totalBytes += value.byteLength;

    if (totalBytes > SOCIAL_REQUEST_MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error("This social request is too large.");
    }

    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(body);
}
