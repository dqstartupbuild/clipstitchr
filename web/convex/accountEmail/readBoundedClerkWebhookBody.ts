const MAX_CLERK_WEBHOOK_BODY_BYTES = 64 * 1_024;

export async function readBoundedClerkWebhookBody(request: Request) {
  const declaredLength = Number(request.headers.get("content-length"));

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_CLERK_WEBHOOK_BODY_BYTES
  ) {
    throw new Error("Webhook body is too large.");
  }

  if (!request.body) return;

  const reader = request.body.getReader();
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) return;
    receivedBytes += value.byteLength;

    if (receivedBytes > MAX_CLERK_WEBHOOK_BODY_BYTES) {
      void reader.cancel().catch(() => undefined);
      throw new Error("Webhook body is too large.");
    }
  }
}
