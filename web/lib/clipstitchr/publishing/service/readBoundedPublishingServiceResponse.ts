const MAX_PUBLISHING_SERVICE_RESPONSE_BYTES = 524_288;

export async function readBoundedPublishingServiceResponse(
  response: Response,
): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  if (!response.body) {
    throw new Error("Publishing service returned an empty response.");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    byteLength += value.byteLength;

    if (byteLength > MAX_PUBLISHING_SERVICE_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error("Publishing service response exceeded its safe limit.");
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
    throw new Error("Publishing service returned invalid JSON.");
  }
}
