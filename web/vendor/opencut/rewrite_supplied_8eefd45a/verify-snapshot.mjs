import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { verifySnapshot } from "./verification/verifySnapshot.mjs";

const snapshotDirectory = dirname(fileURLToPath(import.meta.url));
const verification = await verifySnapshot(snapshotDirectory);

process.stdout.write(
  `Verified ${verification.fileCount} supplied OpenCut rewrite files at ${verification.snapshotVersion} (${verification.manifestSha256}).\n`,
);
