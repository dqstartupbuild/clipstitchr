import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";

export async function readStudioClipsObjectBody(
  body: unknown,
  maximumBytes: number,
): Promise<Uint8Array> {
  if (!body || !(Symbol.asyncIterator in Object(body))) {
    throw new StudioClipsWorkerError({
      code: "R2_OBJECT_BODY_MISSING",
      kind: "retryable",
      publicMessage: "The saved Studio Clips object was empty.",
    });
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of body as AsyncIterable<Uint8Array | string>) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.byteLength;
    if (size > maximumBytes) {
      throw new StudioClipsWorkerError({
        code: "R2_OBJECT_TOO_LARGE",
        kind: "permanent",
        publicMessage: "The saved Studio Clips object exceeded its size limit.",
      });
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}
