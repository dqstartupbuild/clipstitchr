import { lstat } from "node:fs/promises";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";

export async function assertStudioClipsLocalFileSize(
  filePath: string,
  expectedBytes: number,
  maximumBytes: number,
): Promise<void> {
  let metadata;

  try {
    metadata = await lstat(filePath);
  } catch (cause) {
    throw new StudioClipsWorkerError({
      cause,
      code: "LOCAL_ARTIFACT_MISSING",
      kind: "permanent",
      publicMessage: "A pipeline file is missing from its temporary workspace.",
    });
  }

  if (
    !metadata.isFile() ||
    metadata.isSymbolicLink() ||
    metadata.size !== expectedBytes ||
    metadata.size < 1 ||
    metadata.size > maximumBytes
  ) {
    throw new StudioClipsWorkerError({
      code: "LOCAL_ARTIFACT_SIZE_MISMATCH",
      kind: "permanent",
      publicMessage: "A pipeline file did not match its validated size.",
    });
  }
}
