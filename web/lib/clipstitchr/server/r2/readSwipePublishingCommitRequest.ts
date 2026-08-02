const SWIPE_PUBLISHING_COMMIT_BODY_MAX_BYTES = 1024;

export type SwipePublishingCommitRequest = {
  attemptId: string;
};

export async function readSwipePublishingCommitRequest(
  request: Request,
): Promise<SwipePublishingCommitRequest> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > SWIPE_PUBLISHING_COMMIT_BODY_MAX_BYTES) {
    throw new Error("Swipe publishing commit request is too large.");
  }

  if (!request.body) {
    throw new Error("Missing Swipe publishing commit request.");
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

    if (byteLength > SWIPE_PUBLISHING_COMMIT_BODY_MAX_BYTES) {
      await reader.cancel();
      throw new Error("Swipe publishing commit request is too large.");
    }

    chunks.push(value);
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let body: { attemptId?: unknown };

  try {
    body = JSON.parse(new TextDecoder().decode(bytes)) as {
      attemptId?: unknown;
    };
  } catch {
    throw new Error("Invalid Swipe publishing commit request.");
  }

  if (
    typeof body.attemptId !== "string" ||
    !body.attemptId.trim() ||
    body.attemptId.length > 120
  ) {
    throw new Error("Invalid Swipe publishing upload attempt.");
  }

  return { attemptId: body.attemptId.trim() };
}
