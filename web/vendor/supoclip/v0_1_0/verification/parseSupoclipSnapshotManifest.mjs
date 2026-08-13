import { isAbsolute, relative, resolve, sep } from "node:path";

export const parseSupoclipSnapshotManifest = (
  manifest,
  upstreamDirectory,
) => {
  const records = new Map();
  const normalizedManifest = manifest.trimEnd();

  if (!normalizedManifest) {
    throw new Error("SupoClip SHA256SUMS must not be empty");
  }

  for (const line of normalizedManifest.split("\n")) {
    const match = /^([a-f0-9]{64})  ([^\0\r\n]+)$/.exec(line);

    if (!match) {
      throw new Error(`Invalid SupoClip SHA256SUMS line: ${line}`);
    }

    const [, expectedHash, relativePath] = match;

    if (
      isAbsolute(relativePath) ||
      relativePath.includes("\\") ||
      relativePath.split("/").some((segment) => !segment || segment === "." || segment === "..")
    ) {
      throw new Error(
        `Unsafe SupoClip SHA256SUMS path: ${relativePath}`,
      );
    }

    if (records.has(relativePath)) {
      throw new Error(`Duplicate SupoClip SHA256SUMS path: ${relativePath}`);
    }

    const absolutePath = resolve(upstreamDirectory, relativePath);
    const relativeToUpstream = relative(upstreamDirectory, absolutePath);
    const canonicalRelativePath = relativeToUpstream.split(sep).join("/");

    if (
      relativeToUpstream.startsWith(`..${sep}`) ||
      relativeToUpstream === ".." ||
      absolutePath === resolve(upstreamDirectory) ||
      canonicalRelativePath !== relativePath
    ) {
      throw new Error(
        `SupoClip SHA256SUMS path leaves upstream boundary: ${relativePath}`,
      );
    }

    records.set(relativePath, expectedHash);
  }

  return records;
};
