import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createSnapshotSha256 } from "./createSnapshotSha256.mjs";
import { listSnapshotRegularFiles } from "./listSnapshotRegularFiles.mjs";
import { parseSnapshotManifest } from "./parseSnapshotManifest.mjs";

export const verifySnapshot = async (snapshotDirectory) => {
  const manifestPath = join(snapshotDirectory, "SHA256SUMS");
  const provenancePath = join(snapshotDirectory, "PROVENANCE.json");
  const upstreamDirectory = join(snapshotDirectory, "upstream");
  const [manifest, provenanceSource] = await Promise.all([
    readFile(manifestPath),
    readFile(provenancePath, "utf8"),
  ]);
  const provenance = JSON.parse(provenanceSource);
  const actualManifestHash = createSnapshotSha256(manifest);

  if (actualManifestHash !== provenance.verification.manifestSha256) {
    throw new Error(
      `Manifest digest mismatch: expected ${provenance.verification.manifestSha256}, received ${actualManifestHash}`,
    );
  }

  const expectedFiles = parseSnapshotManifest(
    manifest.toString("utf8"),
    upstreamDirectory,
  );
  const actualFiles = (
    await listSnapshotRegularFiles(upstreamDirectory, upstreamDirectory)
  ).sort();

  if (expectedFiles.size !== provenance.verification.regularFileCount) {
    throw new Error(
      `Manifest file count mismatch: expected ${provenance.verification.regularFileCount}, received ${expectedFiles.size}`,
    );
  }

  const actualFileSet = new Set(actualFiles);

  for (const relativePath of expectedFiles.keys()) {
    if (!actualFileSet.has(relativePath)) {
      throw new Error(`Manifest file is missing: ${relativePath}`);
    }
  }

  for (const relativePath of actualFiles) {
    const expectedHash = expectedFiles.get(relativePath);

    if (!expectedHash) {
      throw new Error(`Snapshot contains an unmanifested file: ${relativePath}`);
    }

    const actualHash = createSnapshotSha256(
      await readFile(resolve(upstreamDirectory, relativePath)),
    );

    if (actualHash !== expectedHash) {
      throw new Error(
        `File digest mismatch for ${relativePath}: expected ${expectedHash}, received ${actualHash}`,
      );
    }
  }

  return {
    fileCount: actualFiles.length,
    manifestSha256: actualManifestHash,
    snapshotVersion: provenance.snapshotVersion,
  };
};
