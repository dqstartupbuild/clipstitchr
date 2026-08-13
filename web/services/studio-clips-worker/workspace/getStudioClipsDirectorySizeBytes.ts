import { lstat, readdir } from "node:fs/promises";
import { join } from "node:path";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";

export async function getStudioClipsDirectorySizeBytes(
  directoryPath: string,
  maximumBytes: number,
): Promise<number> {
  let totalBytes = 0;
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(directoryPath, entry.name);
    const metadata = await lstat(entryPath);

    if (metadata.isSymbolicLink()) {
      throw new StudioClipsWorkerError({
        code: "WORKSPACE_SYMLINK_REJECTED",
        kind: "permanent",
        publicMessage: "Temporary pipeline workspaces cannot contain links.",
      });
    }

    if (metadata.isDirectory()) {
      totalBytes += await getStudioClipsDirectorySizeBytes(
        entryPath,
        maximumBytes - totalBytes,
      );
    } else if (metadata.isFile()) {
      totalBytes += metadata.size;
    } else {
      throw new StudioClipsWorkerError({
        code: "WORKSPACE_ENTRY_REJECTED",
        kind: "permanent",
        publicMessage: "The temporary workspace contains an unsupported entry.",
      });
    }

    if (totalBytes > maximumBytes) {
      throw new StudioClipsWorkerError({
        code: "WORKSPACE_LIMIT_EXCEEDED",
        kind: "permanent",
        publicMessage:
          "This Studio Clips run exceeded its temporary storage limit.",
      });
    }
  }

  return totalBytes;
}
