import { createWriteStream } from "node:fs";
import { rename, rm } from "node:fs/promises";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

export async function writeStudioReelObjectBody(input: {
  body: unknown;
  maximumBytes: number;
  outputPath: string;
}) {
  if (!input.body || !(Symbol.asyncIterator in Object(input.body))) {
    throw new StudioReelWorkerError({
      code: "R2_OBJECT_BODY_MISSING",
      kind: "retryable",
      publicMessage: "A Studio Stitch source object was empty.",
    });
  }
  const partialPath = `${input.outputPath}.partial`;
  let size = 0;
  const limiter = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      size += chunk.byteLength;
      callback(
        size > input.maximumBytes
          ? new StudioReelWorkerError({
              code: "R2_OBJECT_TOO_LARGE",
              kind: "permanent",
              publicMessage: "A Studio Stitch object exceeded its size limit.",
            })
          : null,
        chunk,
      );
    },
  });
  try {
    await pipeline(
      Readable.from(input.body as AsyncIterable<Uint8Array>),
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
