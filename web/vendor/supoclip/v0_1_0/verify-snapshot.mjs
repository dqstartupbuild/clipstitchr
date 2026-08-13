import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { verifySupoclipSnapshot } from "./verification/verifySupoclipSnapshot.mjs";

const snapshotDirectory = dirname(fileURLToPath(import.meta.url));
const verification = await verifySupoclipSnapshot(snapshotDirectory);

process.stdout.write(
  `Verified ${verification.fileCount} SupoClip v${verification.snapshotVersion} files in ${verification.directoryCount} directories (${verification.manifestSha256}).\n`,
);
