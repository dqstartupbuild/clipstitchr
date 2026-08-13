export async function readStudioClipsJsonObject(
  request: Request,
  maxBytes = 64 * 1024,
) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) {
    throw new Error("The Studio Clips request byte limit is invalid.");
  }
  const declaredHeader = request.headers.get("content-length");
  const declaredBytes = declaredHeader === null ? null : Number(declaredHeader);
  if (
    declaredBytes !== null &&
    (!Number.isSafeInteger(declaredBytes) ||
      declaredBytes < 0 ||
      declaredBytes > maxBytes)
  ) {
    await request.body?.cancel().catch(() => undefined);
    throw new Error("The Studio Clips request body is invalid.");
  }
  if (!request.body) {
    throw new Error("The Studio Clips request body is invalid.");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      totalBytes += result.value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new Error("The Studio Clips request body is invalid.");
      }
      chunks.push(result.value);
    }
  } finally {
    reader.releaseLock();
  }
  if (totalBytes === 0) {
    throw new Error("The Studio Clips request body is invalid.");
  }
  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("The Studio Clips request body must use valid UTF-8.");
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("The Studio Clips request body must be valid JSON.");
  }
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new Error("The Studio Clips request body must be an object.");
  }
  return value as Record<string, unknown>;
}
