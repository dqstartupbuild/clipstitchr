import { createWriteStream } from "node:fs";
import { rename, rm } from "node:fs/promises";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";

export async function writeStudioClipsBrollResponse(input: {
  body: ReadableStream<Uint8Array> | null;
  maximumBytes: number;
  outputPath: string;
}): Promise<number> {
  if (!input.body) {
    throw new StudioClipsWorkerError({
      code: "EMPTY_BROLL_DOWNLOAD",
      kind: "retryable",
      publicMessage: "The B-roll provider returned an empty video.",
    });
  }
  const partialPath = `${input.outputPath}.partial`;
  let size = 0;
  const limiter = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      size += chunk.byteLength;
      callback(
        size > input.maximumBytes
          ? new StudioClipsWorkerError({
              code: "BROLL_DOWNLOAD_TOO_LARGE",
              kind: "permanent",
              publicMessage: "A B-roll video exceeded its size limit.",
            })
          : null,
        chunk,
      );
    },
  });
  try {
    await pipeline(
      Readable.from(input.body as unknown as AsyncIterable<Uint8Array>),
      limiter,
      createWriteStream(partialPath, { flags: "wx", mode: 0o600 }),
    );
    await rename(partialPath, input.outputPath);
    return size;
  } catch (error) {
    await rm(partialPath, { force: true });
    throw error;
  }
}
