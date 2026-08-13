const maximumLazyReelRequestBytes = 32_768;

export async function readLazyReelBoundedJsonBody(request: Request) {
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = Number(contentLengthHeader);

  if (
    contentLengthHeader !== null &&
    (!Number.isSafeInteger(contentLength) ||
      contentLength < 0 ||
      contentLength > maximumLazyReelRequestBytes)
  ) {
    throw new Error("Research request is too large.");
  }

  if (!request.body) {
    throw new Error("Request body is required.");
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

    if (byteLength > maximumLazyReelRequestBytes) {
      await reader.cancel();
      throw new Error("Research request is too large.");
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
    return JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    ) as unknown;
  } catch {
    throw new Error("Research request must be valid JSON.");
  }
}
