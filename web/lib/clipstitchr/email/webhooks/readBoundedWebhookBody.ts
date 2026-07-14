const MAX_LOOPS_WEBHOOK_BODY_BYTES = 64 * 1_024;

export async function readBoundedWebhookBody(request: Request) {
  const declaredLength = Number(request.headers.get("content-length"));

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_LOOPS_WEBHOOK_BODY_BYTES
  ) {
    throw new Error("Webhook body is too large.");
  }

  if (!request.body) {
    return "";
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;
    receivedBytes += value.byteLength;

    if (receivedBytes > MAX_LOOPS_WEBHOOK_BODY_BYTES) {
      await reader.cancel();
      throw new Error("Webhook body is too large.");
    }

    chunks.push(value);
  }

  const body = new Uint8Array(receivedBytes);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder("utf-8", { fatal: true }).decode(body);
}
