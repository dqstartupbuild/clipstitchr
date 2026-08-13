import { open, rename, rm } from "node:fs/promises";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

export async function writeStudioReelProviderBody(input: {
  readonly maximumBytes: number;
  readonly outputPath: string;
  readonly response: Response;
}) {
  const declaredHeader = input.response.headers.get("content-length");
  const declaredBytes = declaredHeader === null ? null : Number(declaredHeader);
  if (
    declaredBytes !== null &&
    (!Number.isSafeInteger(declaredBytes) ||
      declaredBytes < 1 ||
      declaredBytes > input.maximumBytes)
  ) {
    await input.response.body?.cancel().catch(() => undefined);
    throw new StudioReelWorkerError({
      code: "PROVIDER_MEDIA_TOO_LARGE",
      kind: "permanent",
      publicMessage: "Purchased reaction media exceeds the worker byte limit.",
    });
  }
  if (!input.response.body) {
    throw new StudioReelWorkerError({
      code: "PROVIDER_MEDIA_EMPTY",
      kind: "retryable",
      publicMessage: "Purchased reaction media was empty.",
    });
  }
  const partialPath = `${input.outputPath}.partial`;
  const file = await open(partialPath, "wx", 0o600);
  const reader = input.response.body.getReader();
  let totalBytes = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      totalBytes += result.value.byteLength;
      if (totalBytes > input.maximumBytes) {
        await reader.cancel().catch(() => undefined);
        throw new StudioReelWorkerError({
          code: "PROVIDER_MEDIA_TOO_LARGE",
          kind: "permanent",
          publicMessage: "Purchased reaction media exceeds the worker byte limit.",
        });
      }
      await file.write(result.value);
    }
    if (totalBytes < 1) {
      throw new StudioReelWorkerError({
        code: "PROVIDER_MEDIA_EMPTY",
        kind: "retryable",
        publicMessage: "Purchased reaction media was empty.",
      });
    }
    await file.sync();
    await file.close();
    await rename(partialPath, input.outputPath);
    return totalBytes;
  } catch (error) {
    await file.close().catch(() => undefined);
    await rm(partialPath, { force: true });
    throw error;
  } finally {
    reader.releaseLock();
  }
}
