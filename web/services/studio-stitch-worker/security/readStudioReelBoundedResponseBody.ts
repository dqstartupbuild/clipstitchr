import { StudioReelWorkerError } from "../errors/StudioReelWorkerError";

export async function readStudioReelBoundedResponseBody(input: {
  maximumBytes: number;
  response: Response;
  tooLargeMessage: string;
}) {
  const declaredHeader = input.response.headers.get("content-length");
  const declared = declaredHeader === null ? null : Number(declaredHeader);
  if (
    declared !== null &&
    (!Number.isSafeInteger(declared) || declared < 0 || declared > input.maximumBytes)
  ) {
    await input.response.body?.cancel().catch(() => undefined);
    throw new StudioReelWorkerError({
      code: "RESPONSE_BODY_TOO_LARGE",
      kind: "permanent",
      publicMessage: input.tooLargeMessage,
    });
  }
  if (!input.response.body) return new Uint8Array();
  const reader = input.response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      total += result.value.byteLength;
      if (total > input.maximumBytes) {
        await reader.cancel().catch(() => undefined);
        throw new StudioReelWorkerError({
          code: "RESPONSE_BODY_TOO_LARGE",
          kind: "permanent",
          publicMessage: input.tooLargeMessage,
        });
      }
      chunks.push(result.value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}
