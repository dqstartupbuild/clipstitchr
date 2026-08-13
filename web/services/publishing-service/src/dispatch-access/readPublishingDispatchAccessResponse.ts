const MAXIMUM_DISPATCH_ACCESS_RESPONSE_BYTES = 256;

export const readPublishingDispatchAccessResponse = async (
  response: Response,
): Promise<boolean> => {
  const declaredLength = response.headers.get("content-length");
  if (
    !response.ok ||
    response.body === null ||
    (declaredLength !== null &&
      (!/^\d+$/u.test(declaredLength) ||
        Number(declaredLength) > MAXIMUM_DISPATCH_ACCESS_RESPONSE_BYTES))
  ) {
    throw new Error("Publishing dispatch access could not be verified.");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  try {
    while (true) {
      const chunk = await reader.read();

      if (chunk.done) {
        break;
      }

      byteLength += chunk.value.byteLength;
      if (byteLength > MAXIMUM_DISPATCH_ACCESS_RESPONSE_BYTES) {
        await reader.cancel();
        throw new Error("Publishing dispatch access could not be verified.");
      }
      chunks.push(chunk.value);
    }
  } finally {
    reader.releaseLock();
  }

  let value: unknown;

  try {
    value = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(
        Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))),
      ),
    ) as unknown;
  } catch {
    throw new Error("Publishing dispatch access could not be verified.");
  }

  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    Object.keys(value).length !== 1 ||
    typeof (value as Record<string, unknown>)["allowed"] !== "boolean"
  ) {
    throw new Error("Publishing dispatch access could not be verified.");
  }

  return (value as Readonly<{ allowed: boolean }>).allowed;
};
