import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createSupoclipSnapshotSha256 } from "./createSupoclipSnapshotSha256.mjs";
import { inspectSupoclipSnapshotTree } from "./inspectSupoclipSnapshotTree.mjs";
import { parseSupoclipSnapshotManifest } from "./parseSupoclipSnapshotManifest.mjs";

export const verifySupoclipSnapshot = async (snapshotDirectory) => {
  const manifestPath = join(snapshotDirectory, "SHA256SUMS");
  const provenancePath = join(snapshotDirectory, "PROVENANCE.json");
  const upstreamDirectory = join(snapshotDirectory, "upstream");
  const [manifest, provenanceSource] = await Promise.all([
    readFile(manifestPath),
    readFile(provenancePath, "utf8"),
  ]);
  const provenance = JSON.parse(provenanceSource);
  const actualManifestHash = createSupoclipSnapshotSha256(manifest);

  if (actualManifestHash !== provenance.verification.manifestSha256) {
    throw new Error(
      `SupoClip manifest digest mismatch: expected ${provenance.verification.manifestSha256}, received ${actualManifestHash}`,
    );
  }

  const expectedFiles = parseSupoclipSnapshotManifest(
    manifest.toString("utf8"),
    upstreamDirectory,
  );
  const inspectedTree = await inspectSupoclipSnapshotTree(
    upstreamDirectory,
    upstreamDirectory,
  );
  const actualFiles = inspectedTree.files.sort();

  if (expectedFiles.size !== provenance.verification.regularFileCount) {
    throw new Error(
      `SupoClip manifest file count mismatch: expected ${provenance.verification.regularFileCount}, received ${expectedFiles.size}`,
    );
  }

  if (inspectedTree.directoryCount !== provenance.verification.directoryCount) {
    throw new Error(
      `SupoClip directory count mismatch: expected ${provenance.verification.directoryCount}, received ${inspectedTree.directoryCount}`,
    );
  }

  const actualFileSet = new Set(actualFiles);

  for (const relativePath of expectedFiles.keys()) {
    if (!actualFileSet.has(relativePath)) {
      throw new Error(`SupoClip manifest file is missing: ${relativePath}`);
    }
  }

  for (const relativePath of actualFiles) {
    const expectedHash = expectedFiles.get(relativePath);

    if (!expectedHash) {
      throw new Error(
        `SupoClip snapshot contains an unmanifested file: ${relativePath}`,
      );
    }

    const actualHash = createSupoclipSnapshotSha256(
      await readFile(resolve(upstreamDirectory, relativePath)),
    );

    if (actualHash !== expectedHash) {
      throw new Error(
        `SupoClip file digest mismatch for ${relativePath}: expected ${expectedHash}, received ${actualHash}`,
      );
    }
  }

  return {
    directoryCount: inspectedTree.directoryCount,
    fileCount: actualFiles.length,
    manifestSha256: actualManifestHash,
    snapshotVersion: provenance.snapshotVersion,
  };
};
