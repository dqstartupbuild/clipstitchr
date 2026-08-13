import { relative, resolve, sep } from "node:path";

export const parseSnapshotManifest = (manifest, upstreamDirectory) => {
  const records = new Map();

  for (const line of manifest.trimEnd().split("\n")) {
    const match = /^([a-f0-9]{64})  (.+)$/.exec(line);

    if (!match) {
      throw new Error(`Invalid SHA256SUMS line: ${line}`);
    }

    const [, expectedHash, relativePath] = match;

    if (records.has(relativePath)) {
      throw new Error(`Duplicate SHA256SUMS path: ${relativePath}`);
    }

    const absolutePath = resolve(upstreamDirectory, relativePath);
    const relativeToUpstream = relative(upstreamDirectory, absolutePath);

    if (
      relativeToUpstream.startsWith(`..${sep}`) ||
      relativeToUpstream === ".." ||
      absolutePath === resolve(upstreamDirectory)
    ) {
      throw new Error(`SHA256SUMS path leaves upstream boundary: ${relativePath}`);
    }

    records.set(relativePath, expectedHash);
  }

  return records;
};

