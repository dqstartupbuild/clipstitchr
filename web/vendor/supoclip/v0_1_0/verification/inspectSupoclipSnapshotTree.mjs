import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";

export const inspectSupoclipSnapshotTree = async (
  directory,
  upstreamDirectory,
) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  let directoryCount = 1;

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      const nested = await inspectSupoclipSnapshotTree(
        absolutePath,
        upstreamDirectory,
      );
      directoryCount += nested.directoryCount;
      files.push(...nested.files);
      continue;
    }

    if (!entry.isFile()) {
      throw new Error(
        `Unsupported filesystem entry in SupoClip snapshot: ${absolutePath}`,
      );
    }

    files.push(relative(upstreamDirectory, absolutePath).split(sep).join("/"));
  }

  return {
    directoryCount,
    files,
  };
};
