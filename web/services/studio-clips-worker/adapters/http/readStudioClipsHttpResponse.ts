import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";

const maximumResponseBytes = 1_048_576;

export async function readStudioClipsHttpResponse(
  response: Response,
): Promise<unknown> {
  const declared = response.headers.get("content-length");
  const declaredBytes = declared === null ? null : Number(declared);
  if (
    declaredBytes !== null &&
    (!Number.isSafeInteger(declaredBytes) ||
      declaredBytes < 0 ||
      declaredBytes > maximumResponseBytes)
  ) {
    await response.body?.cancel().catch(() => undefined);
    throw new StudioClipsWorkerError({
      code: "WORKER_API_RESPONSE_TOO_LARGE",
      kind: "retryable",
      publicMessage: "The Studio Clips coordinator response was too large.",
    });
  }
  const reader = response.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  if (reader) {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > maximumResponseBytes) {
        await reader.cancel();
        throw new StudioClipsWorkerError({
          code: "WORKER_API_RESPONSE_TOO_LARGE",
          kind: "retryable",
          publicMessage: "The Studio Clips coordinator response was too large.",
        });
      }
      chunks.push(next.value);
    }
  }

  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(
      chunks.length === 1
        ? chunks[0]
        : Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))),
    );
  } catch {
    throw new StudioClipsWorkerError({
      code: "INVALID_WORKER_API_RESPONSE",
      kind: response.status >= 500 ? "retryable" : "permanent",
      publicMessage: "The Studio Clips coordinator returned invalid UTF-8.",
    });
  }
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new StudioClipsWorkerError({
        code: "INVALID_WORKER_API_RESPONSE",
        kind: response.status >= 500 ? "retryable" : "permanent",
        publicMessage: "The Studio Clips coordinator returned invalid JSON.",
      });
    }
  }

  if (!response.ok) {
    throw new StudioClipsWorkerError({
      code: `WORKER_API_${response.status}`,
      kind:
        response.status === 408 ||
        response.status === 409 ||
        response.status === 425 ||
        response.status === 429 ||
        response.status >= 500
          ? "retryable"
          : "permanent",
      publicMessage: "The coordinator rejected the worker request.",
    });
  }

  return payload;
}
