import { opendir, stat } from "node:fs/promises";
import { join } from "node:path";
import { StudioReelWorkerError } from "../errors/StudioReelWorkerError";

export async function getStudioReelDirectorySizeBytes(
  root: string,
  maximumBytes: number,
) {
  let total = 0;
  const pending = [root];
  while (pending.length > 0) {
    const directory = pending.pop()!;
    const entries = await opendir(directory);
    for await (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) pending.push(path);
      else if (entry.isFile()) total += (await stat(path)).size;
      else {
        throw new StudioReelWorkerError({
          code: "UNSAFE_WORKSPACE_ENTRY",
          kind: "permanent",
          publicMessage: "The Studio Stitch workspace contains an unsafe entry.",
        });
      }
      if (total > maximumBytes) {
        throw new StudioReelWorkerError({
          code: "WORKSPACE_LIMIT_EXCEEDED",
          kind: "permanent",
          publicMessage: "Studio Stitch exceeded its temporary workspace limit.",
        });
      }
    }
  }
  return total;
}
