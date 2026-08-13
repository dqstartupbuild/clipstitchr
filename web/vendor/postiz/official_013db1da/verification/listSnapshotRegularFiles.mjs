import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";

export const listSnapshotRegularFiles = async (
  directory,
  upstreamDirectory,
) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(
        ...(await listSnapshotRegularFiles(absolutePath, upstreamDirectory)),
      );
      continue;
    }

    if (!entry.isFile()) {
      throw new Error(`Unsupported filesystem entry in snapshot: ${absolutePath}`);
    }

    files.push(relative(upstreamDirectory, absolutePath).split(sep).join("/"));
  }

  return files;
};
