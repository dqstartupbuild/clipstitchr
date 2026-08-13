const defaultStudioBetaJsonBodyMaxBytes = 16 * 1024;

export async function readStudioBetaBoundedJsonObject(
  request: Request,
  maxBytes = defaultStudioBetaJsonBodyMaxBytes,
): Promise<Record<string, unknown>> {
  const declaredLength = request.headers.get("content-length");

  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength);

    if (
      !Number.isSafeInteger(parsedLength) ||
      parsedLength < 0 ||
      parsedLength > maxBytes
    ) {
      throw new Error("The Studio request body is too large.");
    }
  }

  if (!request.body) {
    throw new Error("The Studio request body is required.");
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let byteLength = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel("Studio request body exceeded its byte limit.");
        throw new Error("The Studio request body is too large.");
      }

      text += decoder.decode(value, { stream: true });
    }

    text += decoder.decode();
  } catch (error) {
    if (error instanceof Error && /too large/i.test(error.message)) {
      throw error;
    }

    throw new Error("The Studio request body must be valid UTF-8 JSON.");
  }

  if (text.length === 0) {
    throw new Error("The Studio request body is required.");
  }

  let value: unknown;

  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("The Studio request body must be valid JSON.");
  }

  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new Error("The Studio request body must be an object.");
  }

  return value as Record<string, unknown>;
}
