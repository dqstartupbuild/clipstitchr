import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { verifySnapshot } from "./verifySnapshot.mjs";

const snapshotDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

it("verifies every vendored OpenCut Classic file against the manifest", async () => {
  await expect(verifySnapshot(snapshotDirectory)).resolves.toEqual({
    fileCount: 1128,
    manifestSha256:
      "c9ef06efaa180f2976b7d34bf589fa95ff8314959603096e68311046683ff502",
    snapshotVersion: "cf5e79e",
  });
});

