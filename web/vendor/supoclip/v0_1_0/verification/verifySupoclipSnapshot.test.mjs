import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { verifySupoclipSnapshot } from "./verifySupoclipSnapshot.mjs";

const snapshotDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

it("verifies every vendored SupoClip file against the immutable manifest", async () => {
  await expect(verifySupoclipSnapshot(snapshotDirectory)).resolves.toEqual({
    directoryCount: 99,
    fileCount: 317,
    manifestSha256:
      "e8ee9d5ed41062e6a059c81835ca1834a49a651dcb6e5bcb6a25ad67f76fe098",
    snapshotVersion: "0.1.0",
  });
});
