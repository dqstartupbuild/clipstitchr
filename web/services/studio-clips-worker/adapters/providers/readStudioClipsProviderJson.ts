import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";

export async function readStudioClipsProviderJson(
  response: Response,
  label: string,
  maximumBytes = 2_097_152,
): Promise<unknown> {
  const declared = response.headers.get("content-length");
  const declaredBytes = declared === null ? null : Number(declared);
  if (
    declaredBytes !== null &&
    (!Number.isSafeInteger(declaredBytes) ||
      declaredBytes < 0 ||
      declaredBytes > maximumBytes)
  ) {
    await response.body?.cancel().catch(() => undefined);
    throw new StudioClipsWorkerError({
      code: "PROVIDER_RESPONSE_TOO_LARGE",
      kind: "permanent",
      publicMessage: `${label} returned too much data.`,
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
      if (size > maximumBytes) {
        await reader.cancel();
        throw new StudioClipsWorkerError({
          code: "PROVIDER_RESPONSE_TOO_LARGE",
          kind: "permanent",
          publicMessage: `${label} returned too much data.`,
        });
      }
      chunks.push(next.value);
    }
  }
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(
      Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))),
    );
  } catch {
    throw new StudioClipsWorkerError({
      code: "INVALID_PROVIDER_RESPONSE",
      kind: "permanent",
      publicMessage: `${label} returned invalid UTF-8.`,
    });
  }
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new StudioClipsWorkerError({
      code: "INVALID_PROVIDER_RESPONSE",
      kind: "permanent",
      publicMessage: `${label} returned invalid JSON.`,
    });
  }
  if (!response.ok) {
    throw new StudioClipsWorkerError({
      code: `PROVIDER_HTTP_${response.status}`,
      kind:
        response.status === 408 ||
        response.status === 409 ||
        response.status === 425 ||
        response.status === 429 ||
        response.status >= 500
          ? "retryable"
          : "permanent",
      publicMessage:
        response.status === 429
          ? `${label} is temporarily rate limited.`
          : `${label} could not complete the request.`,
    });
  }
  return payload;
}
