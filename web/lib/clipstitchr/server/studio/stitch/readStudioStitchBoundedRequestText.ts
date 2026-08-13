export async function readStudioStitchBoundedRequestText(
  request: {
    readonly body: ReadableStream<Uint8Array> | null;
    readonly headers: Headers;
  },
  maximumBytes: number,
) {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 1) {
    throw new Error("Studio Stitch request byte limit is invalid.");
  }
  const declaredHeader = request.headers.get("content-length");
  const declaredBytes = declaredHeader === null ? null : Number(declaredHeader);
  if (
    declaredBytes !== null &&
    (!Number.isSafeInteger(declaredBytes) ||
      declaredBytes < 0 ||
      declaredBytes > maximumBytes)
  ) {
    await request.body?.cancel().catch(() => undefined);
    throw new Error("Studio Stitch request exceeds its byte limit.");
  }
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      totalBytes += result.value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel().catch(() => undefined);
        throw new Error("Studio Stitch request exceeds its byte limit.");
      }
      chunks.push(result.value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("Studio Stitch request must use valid UTF-8.");
  }
}
